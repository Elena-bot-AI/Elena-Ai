import { startPolling } from "@/lib/telegram/bot-instance";

(async function main() {
  console.log("Starting Telegram bot in POLLING mode (local dev)…");
  console.log("Bot commands available: /start, /reset, /help, /status, /llm, /stop");
  await startPolling();
})();
