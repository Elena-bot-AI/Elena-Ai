# Бот-диагностик МГТ/ЗГТ - Independent Review

## Review Checkpoints

### CP-R1: State-машина 24 шага, все AC клинических правил покрыты
- **Type**: `rule`
- **Covers**: AC-1, AC-2, AC-3, AC-4, AC-5, FR-1..FR-5
- **Evidence**:
  - 8/8 vitest тестов проходят (детерминизм, окно/стаж/тип менопаузы, абсолютные противопоказания, щитовидка → онколог).
  - API smoke-тест полной сессии: шаги 1→4 последовательные, шаг 10 после 9-го, РМЖ=да → isFinal=true + обе дежурные фразы в summary.
  - 24 шага в steps.ts перечислены в STEP_ORDER с копирайтом вопросов/опций.
  - absoluteContraindicationReasons заполняются и останавливают скрипт сразу (buildVerdict + ранний return).

### CP-R2: Salebot webhook API работает, аутентификация опциональна
- **Type**: `rule`
- **Covers**: FR-7, FR-9, NFR-1
- **Evidence**:
  - POST `/api/bot/step` return JSON: sessionId, nextStepId, question, answerType, options/objectSchema, helpText, isFinal, summary, verdict.
  - `body.answer` нормализует number/boolean/multi/object/string — подходит для любых форматов Salebot.
  - `SALEBOT_SECRET` env + заголовок X-Salebot-Secret: без env принимает всё, с env — 401 на неверный.
  - `salebot_integration.md` с полной инструкцией, curl, примерами payload на каждый answerType.

### CP-R3: LLM-слой 4 провайдера, без внешних SDK, guardrails на диагноз/препараты
- **Type**: `rule`
- **Covers**: FR-6, NFR-3, NFR-4, AC-7
- **Evidence**:
  - lib/llm/index.ts — чистые fetch, zero-runtime deps.
  - Provider: openai / anthropic / gemini / openrouter (дефолт).
  - System prompt явно запрещает диагнозы, препараты, дозировки. Обязательная оговорка про врача.
  - `answerFollowup`: отсутствующий ключ → безопасный fallback-фраза без врача/препаратов.
  - isLlmAvailable() — ключ без sk- или короткий → fallback, бот не падает.

### CP-R4: Build + typecheck + тесты green
- **Type**: `rule`
- **Covers**: NFR-1, все TR build/lint/test
- **Evidence**:
  - `tsc --noEmit` exit 0.
  - `vitest run` 8/8 pass.
  - `next build` exit 0, страница / 3.6 kB first load 90.7 kB, API route /api/bot/step динамический.
  - Dev сервер на localhost:3000 → HTTP 200.

### CP-U1: UI/UX опросника, копирайт шагов понятный, адаптив
- **Type**: `rubric`
- **Covers**: FR-8, AC-6
- **Scale**: 1-5
- **Anchors**: 1 = пропущены шаги, непонятные формулировки; 3 = работает, но сухо; 5 = эмпатичный тон + пояснения терминов + адаптив + индикаторы.
- **Pass Threshold**: >= 4
- **Evidence**:
  - Светлый minimal/brutalist UI (Tailwind) с разделением «шаг + ответ» как в чате.
  - Каждый шаг с helpText (объяснение терминов ГУМС, ЗГТ, противопоказаний).
  - Number/Boolean/Multi/Object/Text инпуты — 5 вариантов форм ввода под каждый тип ответа.
  - Amber-блок финального заключения с жирной пометкой «не заменяет врача».
  - Mobile-first (grid md:2cols, px-4/8 padding).
  - Follow-up вопрос после финала.
  - Score: 4/5 (не хватает micro-анимаций Framer Motion, но AC требует >= 4 → pass).

### CP-U2: Качество кода, структуризация, границы ответственности
- **Type**: `rubric`
- **Covers**: NFR-2
- **Scale**: 1-5
- **Anchors**: 1 = один большой файл, без тестов; 3 = разделены на 2-3 модуля; 5 = чистые границы types/lib/engine/llm/ui/api, 100% детерминизм ядра.
- **Pass Threshold**: >= 4
- **Evidence**:
  - `/types/bot.ts` — типы отдельно.
  - `/lib/engine/` → `steps.ts` (шаги/контент) + `engine.ts` (state-machine) + `verdict.ts` (дежурные фразы) + `sessions.ts` (хранилище).
  - `/lib/llm/index.ts` — pure fetch, не трогает state.
  - `/app/api/bot/step/route.ts` — только транспорт + auth + LLM-обёртка над вердиктом.
  - `/components/Chat.tsx` — только UI fetch к API.
  - Ядро engine/ детерминировано: 2 одинаковых сессии → tags и вердикт совпадают (тест).
  - Score: 5/5.

## Review History

### Review R1
- **Result**: `pass`
- **Evidence**:
  - Команды: `npm run typecheck` (ok), `npm test` (8/8), `npm run build` (ok + routes: `/`, `/_not-found`, `/api/bot/step`).
  - Dev-сервер: http://localhost:3000 → HTTP 200, страница отдаётся.
  - Smoke API: шаги последовательны, абсолютное противопоказание останавливает скрипт, дежурные фразы в summary присутствуют.
  - Rubric CP-U1: 4/5, CP-U2: 5/5 → оба >= threshold.
  - Все AC имеют независимые свидетельства (unit + smoke).
- **Blocked By**: None
- **Resume When**: N/A
