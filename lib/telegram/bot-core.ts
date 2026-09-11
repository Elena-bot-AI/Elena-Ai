import type { SessionState, Step, Answer } from "@/types/bot";
import { advance, asBoolean, asMulti, asNumber, asObject, asText, createInitialState, sessionToFlat24Answers } from "@/lib/engine/engine";
import { STEPS, STEP_FOLLOWUP } from "@/lib/engine/steps";
import { paraphraseVerdict, answerFollowup, isLlmAvailable } from "@/lib/llm";
import { appendSurveyResponse, type SurveySheetRow } from "@/lib/integrations/google-sheets";

type TgChatId = number | string;

export interface TgUserState {
  chatId: TgChatId;
  session: SessionState;
  pendingMultiSelections: Record<string, boolean>;
  awaitingMultiConfirm: boolean;
  awaitingNumberField?: string;
  objectBuffer: Record<string, unknown>;
  objectCurrentField?: string;
  useLlm: boolean;
  inFollowup: boolean;
  lastSummaryText?: string;
  tgUsername?: string;
  tgFirstName?: string;
  savedFinalOnce?: boolean;
  menopauseSubStep?: "ask_started" | "ask_age";
  menopauseStartedValue?: boolean;
}

const store = new Map<TgChatId, TgUserState>();

export function getState(chatId: TgChatId, meta?: { username?: string; firstName?: string }): TgUserState {
  const existing = store.get(chatId);
  if (existing) {
    if (meta?.username && !existing.tgUsername) existing.tgUsername = meta.username;
    if (meta?.firstName && !existing.tgFirstName) existing.tgFirstName = meta.firstName;
    return existing;
  }
  const s: TgUserState = {
    chatId,
    session: createInitialState(`tg-${chatId}`),
    pendingMultiSelections: {},
    awaitingMultiConfirm: false,
    objectBuffer: {},
    useLlm: true,
    inFollowup: false,
    tgUsername: meta?.username,
    tgFirstName: meta?.firstName,
  };
  store.set(chatId, s);
  return s;
}

export function resetState(chatId: TgChatId): TgUserState {
  store.delete(chatId);
  return getState(chatId);
}

export interface TgResponseMessage {
  text: string;
  parseMode?: "MarkdownV2" | "HTML";
  replyMarkup?: any; // grammY InlineKeyboard | ReplyKeyboard
}

function currentStep(state: TgUserState): Step {
  return STEPS[state.session.currentStepId] || STEPS[STEP_FOLLOWUP];
}

export function welcomeMessage(): TgResponseMessage {
  return {
    text: [
      "👋 Здравствуйте! Я помогу пройти предварительный чек-лист по МГТ / ЗГТ перед приёмом гинеколога-эндокринолога.",
      "",
      "⚠️ Важно: я не заменяю очную консультацию врача и не ставлю диагнозы. Всё, что я выдаю — только предварительное заключение для вашего врача.",
      "",
      "Чтобы начать сначала в любой момент — отправьте /start.",
    ].join("\n"),
    parseMode: "MarkdownV2",
  };
}

export function askNext(state: TgUserState): TgResponseMessage {
  if (state.inFollowup) {
    return {
      text:
        "Если есть уточняющий вопрос по теме менопаузы и МГТ — напишите его ниже. ИИ ответит, но помните: ответы не заменяют врача.\n" +
        "Отправьте /stop чтобы закончить, /reset чтобы начать заново.",
    };
  }
  const step = currentStep(state);

  // --- Step 2 (menopause_age) — custom 2-sub-step flow ---
  if (step.id === "menopause_age") {
    // Sub-step 1: Менопауза уже наступила? Да/Нет
    if (!state.menopauseSubStep || state.menopauseSubStep === "ask_started") {
      return {
        text: "*Шаг 2 из 24*\n\nМенопауза уже наступила?\n\n💡 Менопауза — 12 месяцев подряд без менструаций.",
        parseMode: "MarkdownV2",
        replyMarkup: {
          keyboard: [[{ text: "Да, уже наступила" }, { text: "Ещё нет, менструации идут" }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    }
    // Sub-step 2: Во сколько лет наступила?
    if (state.menopauseSubStep === "ask_age") {
      return {
        text: "*Шаг 2 из 24*\n\nВо сколько лет у вас наступила менопауза?\n\nВведите возраст числом, например: `51`.",
        parseMode: "MarkdownV2",
      };
    }
  }

  const intro = `*${escapeMd(step.title || step.id)}*\n\n`;
  const q = escapeMd(step.question);
  const help = step.helpText ? `\n\n💡 ${escapeMd(step.helpText)}` : "";
  return {
    text: intro + q + help,
    parseMode: "MarkdownV2",
    replyMarkup: replyMarkupFor(state, step),
  };
}

function replyMarkupFor(state: TgUserState, step: Step) {
  switch (step.answerType) {
    case "boolean": {
      return yesNo();
    }
    case "multi": {
      return multiToggle(state, step);
    }
    case "object": {
      return objectFieldButtons(state, step);
    }
    case "text":
    case "number":
    case "final":
    default:
      return undefined;
  }
}

function yesNo() {
  return {
    keyboard: [[{ text: "Да" }, { text: "Нет" }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

function multiToggle(state: TgUserState, step: Step) {
  const options = step.options || [];
  const sel = state.pendingMultiSelections;
  const regularOptions = options.filter((o) => o.key !== "nothing_selected");
  const nothingOption = options.find((o) => o.key === "nothing_selected");

  const rows = regularOptions.map((o) => [
    {
      text: (sel[o.key] ? "✅ " : "☐ ") + o.label,
      callback_data: `multi:${step.id}:${o.key}`,
    },
  ]);

  if (nothingOption) {
    rows.push([
      {
        text: (sel["nothing_selected"] ? "✅ " : "☑️ ") + nothingOption.label,
        callback_data: `multi:${step.id}:nothing_selected`,
      },
    ]);
  }

  rows.push([
    { text: "Подтвердить ✓", callback_data: `multi:${step.id}:__ok__` },
    { text: "Очистить всё", callback_data: `multi:${step.id}:__clear__` },
  ]);
  state.awaitingMultiConfirm = true;
  return { inline_keyboard: rows };
}

function objectFieldButtons(state: TgUserState, step: Step) {
  const schema = step.objectSchema || {};
  const keys = Object.keys(schema);
  const rows = keys.map((k) => {
    const val = state.objectBuffer[k];
    const filled = val !== undefined && val !== "" && val !== null;
    return [
      {
        text: (filled ? "✅ " : "• ") + schema[k].label + (filled ? `: ${String(val)}` : ""),
        callback_data: `obj:${step.id}:${k}`,
      },
    ];
  });
  const allFilled =
    keys.filter((k) => {
      const f = schema[k];
      const v = state.objectBuffer[k];
      if (f.kind === "number") return typeof v === "number" && v > 0;
      return v !== undefined;
    }).length === keys.length;
  rows.push([
    {
      text: allFilled ? "Подтвердить ✓" : "Заполнены не все поля",
      callback_data: allFilled ? `obj:${step.id}:__ok__` : `obj:${step.id}:__noop__`,
    },
  ]);
  return { inline_keyboard: rows };
}

export async function handleText(state: TgUserState, rawText: string): Promise<TgResponseMessage[]> {
  const text = rawText.trim();

  if (text === "/start" || text === "/reset") {
    const ns = resetState(state.chatId);
    return [welcomeMessage(), askNext(ns)];
  }
  if (state.inFollowup) {
    if (text === "/stop") {
      state.inFollowup = false;
      return [
        {
          text: "✅ Готово. Спасибо, что воспользовались ботом. Не забудьте проконсультироваться с врачом на приёме!",
        },
      ];
    }
    const answer = await answerFollowup(text, state.lastSummaryText || "");
    return [{ text: answer }];
  }

  const step = currentStep(state);

  // --- Custom Step 2 (menopause_age): 2-sub-step handler ---
  if (step.id === "menopause_age") {
    // Sub-step 1 answer: Да/Ещё нет
    if (!state.menopauseSubStep || state.menopauseSubStep === "ask_started") {
      const isStarted = text.startsWith("Да") || text.toLowerCase().includes("да");
      state.menopauseStartedValue = isStarted;
      state.session.menopauseStarted = isStarted;
      if (isStarted) {
        // Sub-step 2: ask age
        state.menopauseSubStep = "ask_age";
        return [askNext(state)];
      }
      // Not started (Ещё нет): menopauseAge = current age (duration = 0)
      if (typeof state.session.age === "number") {
        state.menopauseSubStep = undefined;
        return doAdvance(state, { type: "number", value: state.session.age });
      }
      // Age missing (shouldn't happen, but safe fallback)
      state.menopauseSubStep = "ask_age";
      return [
        {
          text: "⚠️ Сначала укажите возраст (шаг 1). Нажмите /reset чтобы начать заново.",
        },
      ];
    }
    // Sub-step 2 answer: number (age onset)
    if (state.menopauseSubStep === "ask_age") {
      const n = parseFloat(text);
      if (!Number.isFinite(n) || n <= 0 || n > 100) {
        return [
          {
            text: "⚠️ Введите возраст числом (например `51` или `45`).",
          },
        ];
      }
      state.menopauseSubStep = undefined;
      return doAdvance(state, { type: "number", value: n });
    }
  }

  if (state.objectCurrentField) {
    const field = state.objectCurrentField;
    const schema = step.objectSchema?.[field];
    if (!schema) {
      state.objectCurrentField = undefined;
      return [askNext(state)];
    }
    if (schema.kind === "boolean") {
      const v = text === "Да";
      state.objectBuffer[field] = v;
    } else if (schema.kind === "number") {
      const n = parseFloat(text);
      if (!Number.isFinite(n) || n <= 0) {
        return [
          {
            text: "⚠️ Введите число больше нуля, например: `168` или `68`\nПопробуйте ещё раз.",
            parseMode: "MarkdownV2",
          },
        ];
      }
      state.objectBuffer[field] = n;
    } else {
      const opt = schema.options?.find((o) => o.key === text || o.label === text);
      if (!opt) {
        return [
          {
            text:
              "⚠️ Выберите вариант из кнопок выше в inline-клавиатуре (нажмите на кнопку нужного варианта, а затем на «Подтвердить»).",
          },
        ];
      }
      state.objectBuffer[field] = opt.key;
    }
    state.objectCurrentField = undefined;
    return [askNext(state)];
  }

  switch (step.answerType) {
    case "boolean": {
      const ans: Answer = { type: "boolean", value: text === "Да" };
      return doAdvance(state, ans);
    }
    case "number": {
      const n = parseFloat(text);
      if (!Number.isFinite(n) || n <= 0) {
        return [
          {
            text: "⚠️ Введите, пожалуйста, целое или десятичное число. Например `51` или `49`.",
          },
        ];
      }
      return doAdvance(state, { type: "number", value: n });
    }
    case "text":
    case "final":
    default: {
      return doAdvance(state, { type: "text", value: text });
    }
    case "multi": {
      return [
        {
          text: "Выберите варианты в inline-кнопках под сообщением выше, потом нажмите «Подтвердить ✓».",
        },
      ];
    }
    case "object": {
      return [
        {
          text: "Нажмите на кнопку поля в inline-клавиатуре, введите значение и затем подтвердите весь объект.",
        },
      ];
    }
  }
}

export async function handleCallback(
  state: TgUserState,
  data: string,
): Promise<{ answer?: TgResponseMessage | null; edit?: TgResponseMessage | null }> {
  const parts = data.split(":");
  const kind = parts[0];
  const stepId = parts[1];
  const key = parts.slice(2).join(":");

  if (kind === "multi" && stepId && state.session.currentStepId === stepId) {
    if (key === "__ok__") {
      if (!state.awaitingMultiConfirm) return {};
      const ans: Answer = { type: "multi", value: { ...state.pendingMultiSelections } };
      state.pendingMultiSelections = {};
      state.awaitingMultiConfirm = false;
      const messages = await doAdvance(state, ans);
      return { answer: messages[0] || null, edit: null };
    }
    if (key === "__clear__") {
      state.pendingMultiSelections = {};
      const edit = { text: currentStep(state).question, replyMarkup: replyMarkupFor(state, currentStep(state)) };
      return { edit };
    }
    // Логика взаимоисключения «nothing_selected» vs любые другие варианты:
    // 1) Если клик по nothing_selected — снять ВСЕ другие галки
    if (key === "nothing_selected") {
      const willToggle = !state.pendingMultiSelections["nothing_selected"];
      if (willToggle) {
        // Включаем nothing_selected → очищаем все остальные
        state.pendingMultiSelections = { nothing_selected: true };
      } else {
        // Выключаем nothing_selected → просто убираем его
        delete state.pendingMultiSelections["nothing_selected"];
      }
    } else {
      // 2) Клики по обычным опциям: если было выбрано nothing_selected — снять его
      if (state.pendingMultiSelections["nothing_selected"]) {
        delete state.pendingMultiSelections["nothing_selected"];
      }
      state.pendingMultiSelections[key] = !state.pendingMultiSelections[key];
      if (!state.pendingMultiSelections[key]) delete state.pendingMultiSelections[key];
    }
    const edit: TgResponseMessage = {
      text: currentStep(state).question,
      replyMarkup: replyMarkupFor(state, currentStep(state)),
    };
    return { edit };
  }

  // BUG FIX 2026-09-10: __select MUST be checked BEFORE generic obj block
  // otherwise obj:stepId:__select:field:value hits step.objectSchema[key]=__select... (undefined) and returns {}
  if (kind === "obj" && stepId && state.session.currentStepId === stepId && key.startsWith("__select:")) {
    const pieces = key.split(":");
    const fieldName = pieces[1];
    const value = pieces.slice(2).join(":");
    const step = currentStep(state);
    const schema = step.objectSchema?.[fieldName];
    if (schema?.kind === "select") {
      state.objectBuffer[fieldName] = value;
    }
    state.objectCurrentField = undefined;
    return { edit: { text: currentStep(state).question, replyMarkup: replyMarkupFor(state, currentStep(state)) } };
  }

  if (kind === "obj" && stepId && state.session.currentStepId === stepId) {
    const step = currentStep(state);
    if (key === "__noop__") return {};
    if (key === "__ok__") {
      const ans: Answer = { type: "object", value: { ...state.objectBuffer } };
      state.objectBuffer = {};
      state.objectCurrentField = undefined;
      const messages = await doAdvance(state, ans);
      return { answer: messages[0] || null, edit: null };
    }
    const schema = step.objectSchema?.[key];
    if (!schema) return {};
    state.objectCurrentField = key;
    if (schema.kind === "boolean") {
      return {
        answer: {
          text: `Отметьте ${escapeMd(schema.label)}:`,
          parseMode: "MarkdownV2",
          replyMarkup: yesNo(),
        },
      };
    }
    if (schema.kind === "select" && schema.options) {
      return {
        answer: {
          text: `Выберите вариант для *${escapeMd(schema.label)}*:`,
          parseMode: "MarkdownV2",
          replyMarkup: {
            inline_keyboard: schema.options.map((o) => [
              { text: o.label, callback_data: `obj:${step.id}:__select:${key}:${o.key}` },
            ]),
          },
        },
      };
    }
    return {
      answer: {
        text: `Введите числом *${escapeMd(schema.label)}* (например: \`168\`):`,
        parseMode: "MarkdownV2",
      },
    };
  }

  return {};
}

async function doAdvance(state: TgUserState, ans: Answer): Promise<TgResponseMessage[]> {
  const res = advance(state.session, ans);
  state.session = res.newState;

  if (res.isFinal && res.verdict && !state.savedFinalOnce) {
    let summary = res.verdict.summary;
    let llmText: string | undefined;
    if (state.useLlm) {
      const p = await paraphraseVerdict(res.verdict.summary);
      if (p) {
        summary = p;
        llmText = p;
      }
    }
    state.lastSummaryText = summary;
    state.inFollowup = true;
    state.savedFinalOnce = true;

    // 📥 Сохраняем в Google Sheets — не блокируем пользователя (fire-and-forget)
    (async function saveToSheet() {
      try {
        const row: SurveySheetRow = {
          chat_id: state.chatId,
          tg_username: state.tgUsername,
          tg_first_name: state.tgFirstName,
          session_id: state.session.sessionId,
          step_count: state.session.completedStepIds.length,
          is_final: true,
          verdict_tag: (res.verdict as any).tag || (res.verdict!.tags || []).join(",") || "final",
          answers: (state.session as any).answers || undefined,
          flat_answers_24: sessionToFlat24Answers(state.session),
          summary_engine: res.verdict!.summary,
          llm_paraphrase: llmText,
        };
        const r = await appendSurveyResponse(row);
        if (!r.ok) console.warn("google sheet save skipped:", r.error);
        else console.log("✅ saved to google sheets, chat_id", state.chatId);
      } catch (e) {
        console.warn("google sheet save exception:", e);
      }
    })();

    const verdictText =
      "🧾 *ПРЕДВАРИТЕЛЬНОЕ ЗАКЛЮЧЕНИЕ* — только для обсуждения с вашим врачом\\. Не заменяет очный приём\\.\n\n" +
      escapeMd(summary) +
      "\n\n" +
      `опишите, что именно вас беспокоит \\(тема: менопауза / МГТ / симптомы\\)\\. Введите /reset чтобы начать заново, /stop чтобы закончить\\.`;

    return [
      {
        text: verdictText,
        parseMode: "MarkdownV2",
      },
    ];
  }

  if (res.nextStep) {
    state.session.currentStepId = res.nextStep.id;
  }
  return [askNext(state)];
}

function escapeMd(text: string): string {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

export { isLlmAvailable };
