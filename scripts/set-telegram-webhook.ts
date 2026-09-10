import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || process.argv[2];
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN не задан");
  process.exit(1);
}
if (!SITE) {
  console.error("Укажи NEXT_PUBLIC_SITE_URL= или передавай аргументом: npm run bot:set-webhook https://мой-сайт.ру");
  process.exit(1);
}

const base = SITE.endsWith("/") ? SITE.slice(0, -1) : SITE;
const url = `${base}/api/telegram${SECRET ? "?secret=" + encodeURIComponent(SECRET) : ""}`;

fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url,
    secret_token: SECRET || undefined,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch((e) => {
    console.error("setWebhook failed", e);
    process.exit(2);
  });
