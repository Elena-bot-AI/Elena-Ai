# Бот-диагностик МГТ/ЗГТ - Implementation Plan

## Task 1: Инициализация Next.js проекта + структура
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Инициализировать Next.js 15 App Router + TypeScript в `/Users/annavolkova/Desktop/salebot ai/`
  - Добавить .env.example с LLM_PROVIDER / ключами / SALEBOT_SECRET
  - Создать папки: `app/`, `app/api/bot/step/`, `lib/engine/`, `lib/llm/`, `types/`
- **Acceptance Criteria Addressed**: FR-1, FR-7, FR-8, NFR-4
- **Test Requirements**:
  - `rule` TR-1.1: `npx tsc --noEmit` проходит без ошибок типов
  - `rule` TR-1.2: `npm run dev` поднимается на :3000, отдаёт Hello World
- **Notes**: Если в папке уже есть package.json — использовать его, не переинициализировать

## Task 2: Ядро логики — дерево вопросов и state-machine (engine.ts)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Описать типы: SessionState, Step, Answer, Indications, Contraindications, RiskFactors, OncoHistory, Verdict
  - Запрограммировать шаги строго в порядке:
    1. Возраст (число)
    2. Возраст наступления менопаузы (число) → вычислить тип менопаузы + стаж + окно возможностей
    3. Приливы жара (да/нет) → systemic_mht
    4. Сухость во влагалище при ПА (да/нет) → local_mht
    5. Болезненность при ПА (да/нет) → local_mht
    6. Отказ от ПА из-за боли (да/нет) → local_mht
    7. Симптомы ГУМС (мульти-чек): учащённое безболезненное / болезненное / затруднённое / ноктурия >1 / стрессовое недержание / частые циститы / дискомфорт вульвы (каждый положительный → local_mht)
    8. Рост (см), вес (кг), курение, СД, физ. активность → ИМТ, osteoporosis_prophylaxis = true для всех
    9. УЗИ-эндометрий: гиперплазия / полип / субмукозная миома (да/нет по каждому) → АБСОЛЮТНОЕ ПРОТИВОПОКАЗАНИЕ при да
    10. Неопределённые боли в животе → АБСОЛЮТНОЕ при да
    11. Аллергия на МГТ/ЗГТ → АБСОЛЮТНОЕ при да
    12. Диагнозы РМЖ / Р эндометрия / Р яичников / менингиома → АБСОЛЮТНОЕ при да
    13. Кожная порфирия → АБСОЛЮТНОЕ при да
    14. Эндометриоидные кисты / инфильтративный эндометриоз / эндометриоз кишечника → АБСОЛЮТНОЕ (для гестагенов, помечаем как contraindication)
    15. Неустановленные кровотечения из ПТ → АБСОЛЮТНОЕ при да
    16. РМЖ лечение/подозрение → АБСОЛЮТНОЕ при да
    17. Р эндометрия/яичников/шейки обследование/лечение → АБСОЛЮТНОЕ при да
    18. Заболевания печени: гепатит/опухоли/цирроз/недостаточность/Р печени/метастазы/отмена МГТ из-за печени → АБСОЛЮТНОЕ при да
    19. Тромбоз/ТГВ/ТЭЛА/инфаркт/ишемический/геморрагический инсульт → АБСОЛЮТНОЕ при да
    20. Факторы риска (не против): мигрень с/без ауры / генетическая тромбофилия / миома без субмукозных узлов / эндометриоз матки / операции по поводу эндометриоза / курение / повышение АД / ГБ / приём АД / ВЗК → записать в riskFactors[]
    21. Онко-анамнез 1 (не против, требует мониторинг): Р щитовидки / колоректальный / кожа (базалиома, локальная меланома) / гематологические / Р почки / Р ПЖ / микро/макропролактинома → onco_monitoring[]
    22. Онко-анамнез 2 (возможен негативный эффект): Р желудка / Р мочевого пузыря / Р лёгких / метастатическая меланома / опухоль ГМ → onco_negative_effect[]
    23. Холестерин/ЛПНП/триглицериды повышены → riskFactors[]
    24. Варикоз/тромбофлебит в анамнезе/операции ВБ → riskFactors[]
  - Реализовать функцию `nextStep(state, answer): { newState, nextStepId?, isFinal, verdict? }`
  - Реализовать `buildVerdict(state)` с подстановкой дежурных фраз (абсолютные противопоказания / нет абсолютных / онко-мониторинг / негативный эффект / показания системная/топическая/остеопороз)
- **Acceptance Criteria Addressed**: FR-1, FR-2, FR-3, FR-4, FR-5, AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `rule` TR-2.1: Unit-тест vitest: возраст 51, менопауза 49 → тип физиологическая, окно открыто, стаж 2
  - `rule` TR-2.2: Unit-тест: приливы=да → systemic_mht=true
  - `rule` TR-2.3: Unit-тест: РМЖ=да → isFinal=true, verdict содержит «абсолютные противопоказания»
  - `rule` TR-2.4: Unit-тест: две одинаковые сессии → теги deep-equal (детерминизм)
  - `rule` TR-2.5: Unit-тест: Р щитовидки=да → verdict содержит «онколог»
  - `rubric` TR-2.6: Полнота шагов; scale 1-5; anchors 1=пропущено 3+ шагов, 3=все шаги но без ИМТ/стажа, 5=все шаги + все расчёты; threshold >= 4
- **Notes**: При первом же hit абсолютного противопоказания сразу возвращаем isFinal=true, дальше не спрашиваем

## Task 3: LLM-слой — выбор провайдера, промпты, перефразировка
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 2
- **Description**:
  - Реализовать адаптер `lib/llm/index.ts`: openai, anthropic, gemini, openrouter по переменной `LLM_PROVIDER`
  - System prompt на русском:
    - Роль: ассистент гинеколога-эндокринолога, предварительный чек-лист МГТ
    - Строго запрещено: ставить диагноз, назначать препараты/дозы, высказываться вне темы МГТ/менопаузы
    - Обязательно в каждом ответе: «Этот вывод носит предварительный характер и не заменяет очную консультацию врача»
  - Метод 1: `paraphraseVerdict(verdictText)` — перефразировать дежурные фразы более человечно, но сохранить все ключевые термины (абсолютные противопоказания / окно возможностей / системная МГТ / топическая / остеопороз / онколог)
  - Метод 2: `answerFollowup(question, stateSummary)` — свободный вопрос; если не по теме — «я не могу ответить». Если просят дозировку/препарат — «решает только врач».
- **Acceptance Criteria Addressed**: FR-6, NFR-3, AC-7
- **Test Requirements**:
  - `rule` TR-3.1: Paraphrase не удаляет ни одного дежурного пункта из массива `contraindications`, `indications`
  - `rule` TR-3.2: Followup «какую дозировку?» → содержит «не заменяю врача» + нет названия препарата
  - `rule` TR-3.3: Если LLM_PROVIDER не указан или ключа нет — возвращаем оригинальный шаблонный вердикт без падений
  - `rubric` TR-3.4: Естественность формулировок; scale 1-5; anchors 1=дословный шаблон, 3=слегка перефразировано, 5=эмпатично, для человека; threshold >= 4
- **Notes**: OpenRouter по умолчанию — самый дешёвый вариант (deepseek-v3 или llama-3.1-70b)

## Task 4: API-маршрут /api/bot/step + webhook для Salebot
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - POST `/api/bot/step` body: `{ sessionId, stepId, answer }`; sessionId хранит state in-memory в Map (для демо; для прод later Redis)
  - Ответ: `{ nextStepId, question, options?, answerType: number|boolean|multi|final, isFinal, summary?, tags }`
  - Опциональный заголовок `X-Salebot-Secret` — если env `SALEBOT_SECRET` задан — проверять, иначе 401
  - Salebot schema: описать в файле `salebot_integration.md` — как создать шаг «внешний HTTP-запрос», какие переменные сохранять
- **Acceptance Criteria Addressed**: FR-7, FR-9, NFR-1
- **Test Requirements**:
  - `rule` TR-4.1: curl полной сессии шаг за шагом доходит до финала без 500
  - `rule` TR-4.2: Неверный SALEBOT_SECRET → 401
  - `rule` TR-4.3: Без секретки и без env секретки → 200 (демо)
  - `rubric` TR-4.4: Документация интеграции Salebot; scale 1-5; anchors 1=нет примеров, 3=есть пример запроса, 5=скриншотная пошаговая инструкция с JSON payloads; threshold >= 4

## Task 5: Веб-UI чата (Next.js App Router + Tailwind)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - Главная страница app/page.tsx: заголовок «Предварительная диагностика к МГТ/ЗГТ», дисклеймер в шапке
  - Компонент Chat: сообщения слева (бот) и справа (пользователь), typing-индикатор пока ждём /api
  - Форматы ввода: число для возраста, да/нет кнопки, мульти-чек списки, кнопка «задать свой вопрос» после финала
  - Минималистичный светлый UI (как в профиле заказчика: brutalist light, Framer-like transitions optional)
- **Acceptance Criteria Addressed**: FR-8, AC-6
- **Test Requirements**:
  - `rule` TR-5.1: Скрипт на playwright или ручной: пройти все шаги на UI, добраться до вердикта
  - `rule` TR-5.2: Дисклеймер «не заменяет врача» виден в шапке всегда
  - `rubric` TR-5.3: UI/UX; scale 1-5; anchors 1=сырой html, 3=работает но не адаптивно, 5=адаптив mobile-first, эмпатичные переходы; threshold >= 4

## Task 6: Итоговая проверка, прогон тестов, деплой-вектор инструкции
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1–5
- **Description**:
  - `npm run build` проходит без ошибок
  - `npx vitest run` проходит
  - Добавить в README.md (внутри .md) раздел запуска: env, ключи, npm i, dev, build, preview
  - Добавить вектор деплоя: Vercel (однокликовый flow)
- **Acceptance Criteria Addressed**: все
- **Test Requirements**:
  - `rule` TR-6.1: `npm run build` exit code 0
  - `rule` TR-6.2: Все vitest тесты из Task 2+3 green
  - `rule` TR-6.3: `npm run lint` (next lint) green
