# Бот-диагностик к МГТ / ЗГТ (Telegram + Next.js + Vercel + GitHub + OpenAI)

Предварительный чек-лист показаний и противопоказаний к менопаузальной гормональной терапии.
Два интерфейса: **Telegram-бот** (основной) и **веб-чат** (для превью).

> ⚠️ Инструмент не заменяет очную консультацию врача и не ставит диагнозы.

---

## Техстек

| Компонент | Технология |
|---|---|
| Frontend / backend | Next.js 14 (App Router) + TypeScript |
| Telegram Bot | grammY 1.30 (вебхук на Vercel + polling локально) |
| LLM | **Pure OpenAI API** (gpt-4o-mini по умолчанию), 0 внешних SDK — только fetch |
| In-memory sessions | Map в Node (4 часа TTL) — без ПДн, только chat_id + sessionId |
| Dev-зависимости | ESLint, Vitest, tsx (для скриптов), Tailwind (веб-UI) |

---

## Быстрый старт (локально)

1. Клонируй / открывай папку `/Users/annavolkova/Desktop/salebot ai`
2. Копируй `.env.example` → `.env.local`, вставь два токена:

```ini
# LLM = чистый OpenAI (как ты и хотел)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Telegram бот — токен уже прописан в .env.local.example как шаблон
TELEGRAM_BOT_TOKEN=8334659815:AAE91b_XbPKClk3d7LSr9zJ-Ek5rO-IXpOA
```

3. Запускай зависимости и тест:

```bash
npm install
npm run typecheck       # проверка типов
npm test                # 8 vitest тестов движка
npm run build           # сборка next
```

4. Запускай **Telegram-бот polling**:

```bash
npm run dev:bot
# → отправь /start в @ твоего бота
```

5. Отдельно веб-UI (по желанию): `npm run dev` → http://localhost:3000

---

## Команды бота

| Команда | Что делает |
|---|---|
| `/start`, `/reset` | Начать опрос заново (24 шага) |
| `/help` | Список команд |
| `/status` | Пройдено шагов, включён ли LLM |
| `/llm` | Включить/выключить ИИ-перефразировку итогового заключения |
| `/stop` | Закончить follow-up вопросы после финала |

### Как общаться с ботом
- **Числа** (возраст, вес, рост) — просто пришли цифру: `51`, `49`, `168`, `68`
- **Да/Нет** — бот показывает кастомную клавиатуру, нажимай
- **Мульти-выбор** (ГУМС, противопоказания, онко) — inline-кнопки ✅/☐, потом «Подтвердить ✓»
- **Объекты** (рост+вес+курение+СД+активность) — inline-кнопки полей, заполни каждое, затем «Подтвердить ✓»
- **Итог** — бот выдаёт дежурные фразы; если OpenAI-ключ есть, то же самое человечнее; затем follow-up режим «введи вопрос ИИ»

---

## Деплой: GitHub → Vercel → Telegram webhook

### 1. GitHub
- Создай пустой приватный репозиторий, например `annavolkova/mht-diagnostic-bot`
- `cd "/Users/annavolkova/Desktop/salebot ai"`
- `git init && git add . && git commit -m "init"`
- `git remote add origin git@github.com:annavolkova/mht-diagnostic-bot.git && git push -u origin main`

### 2. Vercel (одна кнопка)
1. https://vercel.com/new → import этого репозитория
2. Framework Preset = **Next.js**
3. Environment Variables — вставь 5 переменных:
   - `LLM_PROVIDER=openai`
   - `OPENAI_API_KEY=sk-......`
   - `TELEGRAM_BOT_TOKEN=8334659815:AAE91b_XbPKClk3d7LSr9zJ-Ek5rO-IXpOA`
   - `TELEGRAM_WEBHOOK_SECRET=<придумай-случайную-строку-максимум-250-симв>`
   - `NEXT_PUBLIC_SITE_URL=https://<поддомен>.vercel.app` (взять после первого деплоя)
4. **Deploy → дождись green** и скопируй URL сайта, вставь его в `NEXT_PUBLIC_SITE_URL` → Redeploy

### 3. Привяжи Telegram webhook
Локально из папки проекта запусти **один раз**:

```bash
NEXT_PUBLIC_SITE_URL=https://<твой-vercel-url>.vercel.app \
TELEGRAM_WEBHOOK_SECRET=<тот-же-секрет> \
TELEGRAM_BOT_TOKEN=8334659815:AAE91b_XbPKClk3d7LSr9zJ-Ek5rO-IXpOA \
npm run bot:set-webhook
```

Скрипт вызовет `setWebhook` с `url=https://.../api/telegram?secret=...`. Ответ должен быть `{"ok":true,"result":true,…}`.

Готово. Проверь: пиши боту /start в Телеграме.

---

## Промпт и safety

- System-prompt LLM см. в `lib/llm/index.ts`:
  - Запрет диагнозов, препаратов, дозировок, выхода за тему
  - Обязательная оговорка «не заменяет врача» в каждом ответе
  - Вопрос не по теме → строгий отказ
- Вердикт всегда содержит **две дежурные фразы** из ТЗ (абсолютные противопоказания / нет абсолютных противопоказаний + «только врач после осмотра…»)
- Абсолютное противопоказание останавливает скрипт сразу: дальнейшие вопросы не задаются

---

## Архитектура

```
app/
  page.tsx                        веб-UI превью (не обязателен)
  api/bot/step/route.ts           REST-эндпоинт (вебхуком Tilda/прочие)
  api/telegram/route.ts           вебхук Telegram (Vercel)

lib/
  engine/steps.ts                 24 шага + копирайт вопросов/опций
  engine/engine.ts                advance(state, answer)
  engine/verdict.ts               сборка вердикта с дежурными фразами
  engine/sessions.ts              in-memory сессии (веб-API)
  llm/index.ts                    OpenAI/Anthropic/Gemini/OpenRouter fetch+guardrails
  telegram/bot-core.ts            маппинг шагов бота на engine
  telegram/bot-instance.ts        grammY bot, команды, обработчики

scripts/
  telegram-polling.ts             npm run dev:bot (локальный polling)
  set-telegram-webhook.ts         npm run bot:set-webhook (регистрация вебхука)

tests/engine.test.ts             vitest 8 шт: AC1-AC5 (детерминизм/окно/абсолютные)

types/bot.ts                     SessionState, Verdict, Answer, Step
```

---

## Проверки green

```
tsc --noEmit      → 0 ошибок
vitest run        → 8/8 pass
next build        → ✓ Compiled, routes /, /_not-found, /api/bot/step, /api/telegram
next lint         → 1 warning (react-hooks exhaustive-deps)
dev server :3000  → HTTP 200
API smoke 24 шагов → РМЖ=да → isFinal=true + обе дежурные фразы в summary
```
