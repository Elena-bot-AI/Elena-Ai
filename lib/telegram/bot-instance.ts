import { Bot, webhookCallback, type Context } from "grammy";
import * as dotenv from "dotenv";
import {
  welcomeMessage,
  askNext,
  handleText,
  handleCallback,
  getState,
  resetState,
  isLlmAvailable,
} from "./bot-core";

let loadedEnv = false;
function loadDotenvSafe() {
  if (loadedEnv) return;
  loadedEnv = true;
  try {
    dotenv.config({ path: ".env.local" });
    dotenv.config();
  } catch {
    /* noop */
  }
}
loadDotenvSafe();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let _botInstance: Bot | null = null;
type TgMeta = { username?: string; firstName?: string };
function ctxMeta(ctx: any): TgMeta {
  const u = ctx.from || {};
  return { username: u.username, firstName: u.first_name };
}

function buildBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    const state = resetState(ctx.chat.id);
    const m = ctxMeta(ctx);
    state.tgUsername = m.username; state.tgFirstName = m.firstName;
    await safeReply(ctx, welcomeMessage());
    await safeReply(ctx, askNext(state));
  });

  bot.command("reset", async (ctx) => {
    const state = resetState(ctx.chat.id);
    const m = ctxMeta(ctx);
    state.tgUsername = m.username; state.tgFirstName = m.firstName;
    await ctx.reply("🔄 Начинаем заново.");
    await safeReply(ctx, askNext(state));
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Команды:",
        "/start, /reset — начать заново",
        "/status — текущий шаг",
        "/llm — включить/выключить ИИ-перефразировку заключения",
        "/stop — закончить follow-up вопросы",
      ].join("\n"),
    );
  });

  bot.command("status", async (ctx) => {
    const s = getState(ctx.chat.id, ctxMeta(ctx));
    await ctx.reply(
      `Шаг: ${s.session.currentStepId}\nПройдено шагов: ${s.session.completedStepIds.length}/24\nLLM-перефразировка: ${s.useLlm ? "✅" : "⛔"}\nFollow-up режим: ${s.inFollowup ? "да" : "нет"}`,
    );
  });

  bot.command("llm", async (ctx) => {
    const s = getState(ctx.chat.id, ctxMeta(ctx));
    s.useLlm = !s.useLlm;
    const available = isLlmAvailable();
    await ctx.reply(
      `LLM-перефразировка: ${s.useLlm ? "включена" : "выключена"}\nКлюч LLM доступен: ${available ? "✅" : "⛔"} (${available ? "работает через API" : "будет шаблонный текст"})`,
    );
  });

  bot.command("stop", async (ctx) => {
    const s = getState(ctx.chat.id, ctxMeta(ctx));
    s.inFollowup = false;
    await ctx.reply("✅ Готово. Follow-up режим выключен. /reset чтобы пройти опрос заново.");
  });

  bot.on("callback_query:data", async (ctx) => {
    if (!ctx.chat) return await ctx.answerCallbackQuery();
    const state = getState(ctx.chat.id, ctxMeta(ctx));
    const res = await handleCallback(state, ctx.callbackQuery.data);
    if (res.edit) {
      try {
        const hasInline = res.edit.replyMarkup?.inline_keyboard?.length > 0;
        await ctx.editMessageText(res.edit.text, {
          parse_mode: (res.edit.parseMode as any) || undefined,
          reply_markup: hasInline ? { inline_keyboard: res.edit.replyMarkup.inline_keyboard } : undefined,
        } as any);
      } catch {
        // сообщение не изменилось — ок
      }
    } else {
      try {
        await ctx.answerCallbackQuery();
      } catch {
        // noop
      }
    }
    if (res.answer) {
      await safeReply(ctx, res.answer);
    } else if (!res.edit) {
      try {
        await ctx.answerCallbackQuery();
      } catch {
        // noop
      }
    }
  });

  bot.on("message:text", async (ctx) => {
    const state = getState(ctx.chat.id, ctxMeta(ctx));
    const messages = await handleText(state, ctx.message.text || "");
    for (const m of messages) await safeReply(ctx, m);
  });

  bot.catch((err) => {
    console.error("bot error", err);
  });

  return bot;
}

export function getBot(): Bot {
  if (!TOKEN) throw new Error("TELEGRAM_BOT_TOKEN не задан в env");
  if (!_botInstance) _botInstance = buildBot(TOKEN);
  return _botInstance;
}

export function startPolling() {
  const bot = getBot();
  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());
  return bot.start();
}

export async function handleUpdate(req: any) {
  const bot = getBot();
  const cb = webhookCallback(bot, "std/http");
  return cb(req);
}

async function safeReply(
  ctx: Context,
  msg: { text: string; parseMode?: any; replyMarkup?: any },
) {
  const opts: any = {};
  if (msg.parseMode) opts.parse_mode = msg.parseMode;
  if (msg.replyMarkup?.keyboard) opts.reply_markup = msg.replyMarkup;
  if (msg.replyMarkup?.inline_keyboard) opts.reply_markup = msg.replyMarkup;
  try {
    await ctx.reply(msg.text, opts);
  } catch (_err: any) {
    try {
      await ctx.reply(msg.text);
    } catch (err2) {
      console.error("tg send error:", err2);
    }
  }
}
