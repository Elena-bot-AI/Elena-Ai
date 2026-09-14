type Provider = "openai" | "anthropic" | "gemini" | "openrouter";

const PROVIDER: Provider = (process.env.LLM_PROVIDER as Provider) || "openrouter";

const SYSTEM_PROMPT = `Ты — ассистент гинеколога-эндокринолога. Задача: только перефразировать готовое предварительное заключение по МГТ/ЗГТ простым человеческим языком и отвечать на уточняющие вопросы по теме менопаузы и гормональной терапии.

Жёсткие правила (обязательно выполняй):
1. НИКОГДА не ставь диагноз. НИКОГДА не назначай конкретные препараты, дозы, режимы приёма.
2. Отвечай только на вопросы по теме: менопауза, МГТ, ЗГТ, симптомы менопаузы, остеопороз в менопаузе, ГУМС. На другие темы отвечай строго: «Я не могу дать консультацию по этому вопросу, обратитесь к профильному врачу. Этот вывод носит предварительный характер и не заменяет очную консультацию врача.»
3. В КАЖДОМ ответе (вообще в каждом) ОБЯЗАТЕЛЬНО добавь фразу: «Этот вывод носит предварительный характер и не заменяет очную консультацию врача. Окончательное решение принимает гинеколог-эндокринолог после полного обследования.»
4. Если спрашивают про конкретный препарат / аналог / дозировку / схему — строго отвечай шаблоном: «Подбор препарата, дозировки и схемы МГТ — исключительная прерогатива лечащего врача после полного обследования. Я не могу давать таких рекомендаций. Этот вывод носит предварительный характер и не заменяет очную консультацию врача. Окончательное решение принимает гинеколог-эндокринолог после обследования.»
5. Сохраняй ВСЕ ключевые факты из исходного текста заключения: абсолютные противопоказания, показания (системная / топическая / остеопороз), окно терапевтических возможностей, онко-мониторинг, возможный негативный эффект, факторы риска. Ничего не удаляй и не добавляй лишнего медицинского контента.
6. Тон — эмпатичный, спокойный, для женщины без медицинского образования. Не злоупотребляй сокращениями без пояснения (ГУМС — генитоуринальный синдром менопаузы, ЗГТ — заместительная гормональная терапия, МГТ — менопаузальная гормональная терапия, окно терапевтических возможностей — период, когда начинать МГТ безопаснее всего).
7. Ответ ОБЯЗАТЕЛЬНО на русском языке.
8. Вместо фраз «начинать менопаузу», «начали менопаузу», «у вас началась менопауза» — ОБЯЗАТЕЛЬНО используй фразы «вступать в период менопаузы», «вступили в период менопаузы», «вы вступаете в период менопаузы». Никогда не используй слово «начали» в отношении менопаузы.`;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_URL = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const DEFAULT_MODEL: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-2.0-flash-exp",
  openrouter: "deepseek/deepseek-chat-v3-03:free",
};

function hasKey(p: Provider): boolean {
  switch (p) {
    case "openrouter":
      return !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 3;
    case "openai":
      return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-");
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-");
    case "gemini":
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY.length > 3;
  }
}

export function isLlmAvailable(): boolean {
  return hasKey(PROVIDER);
}

async function chatComplete(system: string, user: string, temp = 0.3, maxTokens = 1500): Promise<string | null> {
  const p = PROVIDER;
  if (!hasKey(p)) return null;
  const model =
    (p === "openrouter"
      ? process.env.OPENROUTER_MODEL
      : p === "openai"
        ? process.env.OPENAI_MODEL
        : p === "anthropic"
          ? process.env.ANTHROPIC_MODEL
          : process.env.GOOGLE_MODEL) || DEFAULT_MODEL[p];

  try {
    if (p === "openai" || p === "openrouter") {
      const url = p === "openrouter" ? OPENROUTER_URL : OPENAI_URL;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${p === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY}`,
      };
      if (p === "openrouter") headers["HTTP-Referer"] = "https://mht-bot.local";
      const body = JSON.stringify({
        model,
        temperature: temp,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      const res = await fetch(url, { method: "POST", headers, body });
      if (!res.ok) {
        console.error(`LLM ${p} HTTP ${res.status} ${await res.text()}`);
        return null;
      }
      const json = (await res.json()) as any;
      const text: string = json?.choices?.[0]?.message?.content || "";
      return text.trim().length > 0 ? text : null;
    }
    if (p === "anthropic") {
      const body = JSON.stringify({
        model,
        system,
        max_tokens: maxTokens,
        temperature: temp,
        messages: [{ role: "user", content: user }],
      });
      const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": String(process.env.ANTHROPIC_API_KEY),
          "anthropic-version": "2023-06-01",
        },
        body,
      });
      if (!res.ok) {
        console.error(`LLM anthropic HTTP ${res.status} ${await res.text()}`);
        return null;
      }
      const json = (await res.json()) as any;
      const block = json.content?.find((b: any) => b.type === "text");
      return block?.text || null;
    }
    if (p === "gemini") {
      const url = GEMINI_URL(model, String(process.env.GOOGLE_GENERATIVE_AI_API_KEY));
      const body = JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        generationConfig: { temperature: temp, maxOutputTokens: maxTokens },
        contents: [{ role: "user", parts: [{ text: user }] }],
      });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        console.error(`LLM gemini HTTP ${res.status} ${await res.text()}`);
        return null;
      }
      const json = (await res.json()) as any;
      return json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (err) {
    console.error("LLM error:", err);
    return null;
  }
  return null;
}

export async function paraphraseVerdict(originalSummary: string): Promise<string> {
  if (!isLlmAvailable()) return fixMenopausePhrases(originalSummary);
  const user = `Ниже — готовое медицинское предварительное заключение по МГТ/ЗГТ. Его факты НЕ ИЗМЕНЯТЬ, ничего не добавлять и не удалять. Единственное, что нужно — перефразировать простым человеческим языком, сохранить структуру, все пункты и все медицинские факты (абсолютные противопоказания, показания, окно терапевтических возможностей, онко-мониторинг, возможный негативный эффект, факторы риска, ИМТ, стаж, тип менопаузы, дежурную оговорку в конце про очную консультацию врача — её ОБЯЗАТЕЛЬНО оставить, как есть или чуть перефразировать но смысл тот же).\n\nИСХОДНЫЙ ТЕКСТ:\n"""\n${originalSummary}\n"""`;
  const result = await chatComplete(SYSTEM_PROMPT, user, 0.3, 2000);
  if (result && result.length > originalSummary.length * 0.5) {
    return fixMenopausePhrases(result);
  }
  return fixMenopausePhrases(originalSummary);
}

function fixMenopausePhrases(text: string): string {
  return text
    .replace(/вы только начали менопаузу/gi, "вы только вступили в период менопаузы")
    .replace(/начали менопаузу/gi, "вступили в период менопаузы")
    .replace(/начинается менопауза/gi, "вступаете в период менопаузы")
    .replace(/началась менопауза/gi, "наступила менопауза");
}

export async function answerFollowup(question: string, stateSummary: string): Promise<string> {
  const fallback =
    "Я могу уточнить общую информацию по теме менопаузы, симптомам и общим принципам МГТ/ЗГТ. Подбор конкретного препарата, дозировки и схемы терапии — исключительно по назначению лечащего врача после полного обследования. Этот вывод носит предварительный характер и не заменяет очную консультацию врача. Окончательное решение принимает гинеколог-эндокринолог.";

  if (!isLlmAvailable()) return fallback;
  if (!question || question.trim().length < 3) return fallback;

  const user = `Контекст: предварительное заключение пациентки по МГТ:\n"""\n${stateSummary || "нет данных"}\n"""\n\nВопрос пациентки (ответь строго по правилам system-prompt):\n"""\n${question}\n"""`;
  const result = await chatComplete(SYSTEM_PROMPT, user, 0.2, 900);
  if (!result || result.length < 20) return fixMenopausePhrases(fallback);
  if (!/не заменяет очную консультацию/.test(result) && !/не заменяет.*врач/.test(result)) {
    return (
      fixMenopausePhrases(result) +
      "\n\nЭтот вывод носит предварительный характер и не заменяет очную консультацию врача. Окончательное решение принимает гинеколог-эндокринолог после полного обследования."
    );
  }
  return fixMenopausePhrases(result);
}
