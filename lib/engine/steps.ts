import type { Step } from "@/types/bot";

export const STEP_AGE = "age";
export const STEP_MENOPAUSE_AGE = "menopause_age";
export const STEP_HOT_FLASHES = "hot_flashes";
export const STEP_VAGINAL_DRYNESS = "vaginal_dryness";
export const STEP_DYSPAREUNIA = "dyspareunia";
export const STEP_SEX_AVOIDANCE = "sex_avoidance";
export const STEP_GUMS = "gums";
export const STEP_BODY = "body";
export const STEP_ENDOMETRIUM_USG = "endometrium_usg";
export const STEP_UNEXPLAINED_PAIN = "unexplained_pain";
export const STEP_MHT_ALLERGY = "mht_allergy";
export const STEP_CANCERS_1 = "cancers_1";
export const STEP_PORPHYRIA = "porphyria";
export const STEP_ENDOMETRIOSIS = "endometriosis";
export const STEP_UNDIAGNOSED_BLEEDING = "undiagnosed_bleeding";
export const STEP_BREAST_CANCER_DETAIL = "breast_cancer_detail";
export const STEP_GYN_CANCER_DETAIL = "gyn_cancer_detail";
export const STEP_LIVER = "liver";
export const STEP_THROMBOSIS_CV = "thrombosis_cv";
export const STEP_RISKS_1 = "risks_1";
export const STEP_ONCO_MONITORING = "onco_monitoring";
export const STEP_ONCO_NEGATIVE = "onco_negative";
export const STEP_LIPID = "lipid";
export const STEP_VARICOSE = "varicose";
export const STEP_FINAL = "final";
export const STEP_FOLLOWUP = "followup";

export const STEPS: Record<string, Step> = {
  [STEP_AGE]: {
    id: STEP_AGE,
    title: "Шаг 1 из 24",
    question: "Сколько вам полных лет?",
    answerType: "number",
    helpText: "Пожалуйста, введите число.",
  },
  [STEP_MENOPAUSE_AGE]: {
    id: STEP_MENOPAUSE_AGE,
    title: "Шаг 2 из 24",
    question: "Во сколько лет у вас наступила менопауза? (если менструации ещё идут — укажите примерный возраст)",
    answerType: "number",
    helpText: "Менопауза — 12 месяцев подряд без менструаций.",
  },
  [STEP_HOT_FLASHES]: {
    id: STEP_HOT_FLASHES,
    title: "Шаг 3 из 24",
    question:
      "Есть ли у вас приливы жара днём и/или ночью, которые нарушают качество жизни?",
    answerType: "boolean",
    helpText: "Приливы жара — прямое показание к системной МГТ.",
  },
  [STEP_VAGINAL_DRYNESS]: {
    id: STEP_VAGINAL_DRYNESS,
    title: "Шаг 4 из 24",
    question: "Испытываете ли вы сухость во влагалище во время половой жизни?",
    answerType: "boolean",
    helpText: "Один из симптомов генитоуринального синдрома менопаузы (ГУМС).",
  },
  [STEP_DYSPAREUNIA]: {
    id: STEP_DYSPAREUNIA,
    title: "Шаг 5 из 24",
    question: "Испытываете ли вы болезненные ощущения во влагалище во время половой жизни?",
    answerType: "boolean",
  },
  [STEP_SEX_AVOIDANCE]: {
    id: STEP_SEX_AVOIDANCE,
    title: "Шаг 6 из 24",
    question: "Отказываетесь ли вы от половой жизни из-за болевых ощущений?",
    answerType: "boolean",
  },
  [STEP_GUMS]: {
    id: STEP_GUMS,
    title: "Шаг 7 из 24",
    question: "Отметьте, что из перечисленного вас беспокоит (можно несколько вариантов):",
    answerType: "multi",
    options: [
      { key: "frequent_painless", label: "Учащённое безболезненное мочеиспускание" },
      { key: "frequent_painful", label: "Учащённое болезненное мочеиспускание" },
      { key: "difficult", label: "Затруднённое мочеиспускание" },
      { key: "nocturia_gt1", label: "Встаёте в ночью в туалет чаще 1 раза" },
      { key: "stress_incontinence", label: "Подтекание мочи при кашле, смехе, нагрузке" },
      { key: "frequent_cystitis", label: "Частые циститы" },
      { key: "vulvar_discomfort", label: "Дискомфорт в половых органах (зуд, жжение, сухость)" },
    ],
    helpText: "Эти симптомы ГУМС — показание для местной (топической) терапии.",
  },
  [STEP_BODY]: {
    id: STEP_BODY,
    title: "Шаг 8 из 24",
    question: "Немного о вашем теле и образе жизни (автоматически посчитаем ИМТ):",
    answerType: "object",
    objectSchema: {
      heightCm: { kind: "number", label: "Рост, см" },
      weightKg: { kind: "number", label: "Вес, кг" },
      smoking: { kind: "boolean", label: "Курите?" },
      diabetes: { kind: "boolean", label: "Есть диагноз «сахарный диабет»?" },
      physicalActivity: {
        kind: "select",
        label: "Физическая активность",
        options: [
          { key: "low", label: "Низкая (менее 150 мин/нед)" },
          { key: "moderate", label: "Умеренная (150–300 мин/нед)" },
          { key: "high", label: "Высокая (регулярные тренировки)" },
        ],
      },
    },
    helpText: "Профилактика остеопороза подходит практически всем женщинам в менопаузе.",
  },
  [STEP_ENDOMETRIUM_USG]: {
    id: STEP_ENDOMETRIUM_USG,
    title: "Шаг 9 из 24",
    question: "Есть ли у вас по данным УЗИ в настоящее время:",
    answerType: "multi",
    options: [
      { key: "endometrial_hyperplasia", label: "Гиперплазия эндометрия" },
      { key: "endometrial_polyp", label: "Полип эндометрия" },
      { key: "submucosal_myoma", label: "Субмукозная миома матки" },
    ],
    helpText: "⚠️ Любой пункт из этого списка — абсолютное противопоказание к МГТ.",
    sensitive: true,
  },
  [STEP_UNEXPLAINED_PAIN]: {
    id: STEP_UNEXPLAINED_PAIN,
    title: "Шаг 10 из 24",
    question:
      "Страдаете ли вы болями в животе, причина которых в настоящее время не определена?",
    answerType: "boolean",
    helpText: "Если не обращались к врачу / не прошли обследование / пьёте обезболивающие сами — отвечайте «да».",
  },
  [STEP_MHT_ALLERGY]: {
    id: STEP_MHT_ALLERGY,
    title: "Шаг 11 из 24",
    question:
      "Были ли у вас аллергические реакции на любые препараты для МГТ / ЗГТ (таблетки, гели, пластыри)?",
    answerType: "boolean",
  },
  [STEP_CANCERS_1]: {
    id: STEP_CANCERS_1,
    title: "Шаг 12 из 24",
    question: "Имеете ли вы установленный диагноз:",
    answerType: "multi",
    options: [
      { key: "breast_cancer", label: "Рак молочной железы" },
      { key: "endometrial_cancer", label: "Рак эндометрия (рак матки)" },
      { key: "ovarian_cancer", label: "Рак яичников" },
      { key: "meningioma", label: "Менингиома" },
    ],
    helpText: "⚠️ Любой пункт — абсолютное противопоказание.",
    sensitive: true,
  },
  [STEP_PORPHYRIA]: {
    id: STEP_PORPHYRIA,
    title: "Шаг 13 из 24",
    question: "Устанавливался ли вам ранее диагноз «кожная порфирия»?",
    answerType: "boolean",
  },
  [STEP_ENDOMETRIOSIS]: {
    id: STEP_ENDOMETRIOSIS,
    title: "Шаг 14 из 24",
    question: "Установлен ли вам в настоящее время диагноз:",
    answerType: "multi",
    options: [
      { key: "endometrioma", label: "Эндометриоидная киста яичника" },
      { key: "infiltrative_endometriosis", label: "Эндометриоидный инфильтрат / инфильтративный эндометриоз" },
      { key: "bowel_endometriosis", label: "Эндометриоз кишечника" },
    ],
    helpText: "⚠️ Абсолютное противопоказание для препаратов гестагенов.",
    sensitive: true,
  },
  [STEP_UNDIAGNOSED_BLEEDING]: {
    id: STEP_UNDIAGNOSED_BLEEDING,
    title: "Шаг 15 из 24",
    question:
      "Страдаете ли вы кровотечениями из половых путей, причина которых не установлена?",
    answerType: "boolean",
    helpText: "Находитесь в стадии обследования / не обращались / пьёте кровоостанавливающие сами — «да».",
  },
  [STEP_BREAST_CANCER_DETAIL]: {
    id: STEP_BREAST_CANCER_DETAIL,
    title: "Шаг 16 из 24",
    question:
      "Проходили ли вы ранее лечение по поводу рака молочной железы ИЛИ находитесь ли вы в стадии обследования по подозрению?",
    answerType: "boolean",
  },
  [STEP_GYN_CANCER_DETAIL]: {
    id: STEP_GYN_CANCER_DETAIL,
    title: "Шаг 17 из 24",
    question:
      "Находитесь ли вы в стадии обследования или лечения по поводу рака эндометрия, рака яичников или рака шейки матки?",
    answerType: "boolean",
  },
  [STEP_LIVER]: {
    id: STEP_LIVER,
    title: "Шаг 18 из 24",
    question: "Есть ли у вас в настоящее время заболевания печени:",
    answerType: "multi",
    options: [
      { key: "active_liver_disease", label: "Гепатит (острый/хр) / доброкачественные опухоли / цирроз / печеночная недостаточность / злокачественные опухоли / метастазы" },
      { key: "liver_mht_cancellation", label: "Был опыт отмены МГТ из-за тяжёлых нарушений функции печени" },
    ],
    helpText: "⚠️ Любой пункт — абсолютное противопоказание.",
    sensitive: true,
  },
  [STEP_THROMBOSIS_CV]: {
    id: STEP_THROMBOSIS_CV,
    title: "Шаг 19 из 24",
    question: "Установлен ли у вас сейчас или устанавливался ранее диагноз:",
    answerType: "multi",
    options: [
      { key: "venous_thrombosis", label: "Тромбоз периферических вен" },
      { key: "dvt", label: "Тромбоз глубоких вен" },
      { key: "pe", label: "Тромбоэмболия лёгочной артерии" },
      { key: "mi", label: "Инфаркт миокарда" },
      { key: "ischemic_stroke", label: "Ишемический инсульт" },
      { key: "hemorrhagic_stroke", label: "Геморрагический инсульт" },
    ],
    helpText: "⚠️ Любой пункт — абсолютное противопоказание.",
    sensitive: true,
  },
  [STEP_RISKS_1]: {
    id: STEP_RISKS_1,
    title: "Шаг 20 из 24",
    question: "Отметьте факторы, которые есть у вас (факторы риска — НЕ противопоказания):",
    answerType: "multi",
    options: [
      { key: "migraine_with_aura", label: "Мигрень с аурой" },
      { key: "migraine_without_aura", label: "Мигрень без ауры" },
      { key: "thrombophilia", label: "Генетическая тромбофилия (высокий риск)" },
      { key: "myoma_no_submucosal", label: "Миома матки (без субмукозного расположения узлов)" },
      { key: "adenomyosis", label: "Эндометриоз матки (аденомиоз)" },
      { key: "endometriosis_surgery_history", label: "Ранее было оперативное лечение по поводу эндометриоза" },
      { key: "elevated_bp", label: "Повышение артериального давления" },
      { key: "hypertension", label: "Гипертоническая болезнь" },
      { key: "bp_medication", label: "Принимаете препараты для снижения АД" },
      { key: "ibd", label: "Воспалительные заболевания кишечника (язвенный колит, болезнь Крона, дивертикулит)" },
    ],
  },
  [STEP_ONCO_MONITORING]: {
    id: STEP_ONCO_MONITORING,
    title: "Шаг 21 из 24",
    question: "Проходили ли вы лечение по поводу (не являются противопоказанием, но требуют мониторинга):",
    answerType: "multi",
    options: [
      { key: "thyroid_cancer", label: "Рак щитовидной железы" },
      { key: "colorectal_cancer", label: "Колоректальный рак" },
      { key: "skin_basal_cell", label: "Рак кожи (базалиома)" },
      { key: "melanoma_local", label: "Меланома кожи (локальная форма)" },
      { key: "hematologic", label: "Гематологический рак (лимфома, лейкемия)" },
      { key: "renal_cancer", label: "Рак почек" },
      { key: "pancreatic_cancer", label: "Рак поджелудочной железы" },
      { key: "microprolactinoma", label: "Микропролактинома" },
      { key: "macroprolactinoma", label: "Макропролактинома" },
    ],
    sensitive: true,
  },
  [STEP_ONCO_NEGATIVE]: {
    id: STEP_ONCO_NEGATIVE,
    title: "Шаг 22 из 24",
    question: "Проходили ли вы лечение по поводу (возможен негативный эффект от МГТ):",
    answerType: "multi",
    options: [
      { key: "gastric_cancer", label: "Рак желудка" },
      { key: "bladder_cancer", label: "Рак мочевого пузыря" },
      { key: "lung_cancer", label: "Рак лёгких" },
      { key: "melanoma_metastatic", label: "Меланома (распространённая метастатическая)" },
      { key: "brain_tumor", label: "Опухоль головного мозга" },
    ],
    sensitive: true,
  },
  [STEP_LIPID]: {
    id: STEP_LIPID,
    title: "Шаг 23 из 24",
    question: "Есть ли по имеющимся данным у вас повышение:",
    answerType: "multi",
    options: [
      { key: "high_cholesterol", label: "Уровня общего холестерина" },
      { key: "high_ldl", label: "Уровня ЛПНП (плохой холестерин)" },
      { key: "high_triglycerides", label: "Уровня триглицеридов" },
    ],
  },
  [STEP_VARICOSE]: {
    id: STEP_VARICOSE,
    title: "Шаг 24 из 24",
    question: "Есть ли у вас варикозная болезнь вен нижних конечностей:",
    answerType: "multi",
    options: [
      { key: "varicose", label: "Варикозная болезнь вен нижних конечностей" },
      { key: "thrombophlebitis_history", label: "Тромбофлебит в анамнезе" },
      { key: "varicose_surgery", label: "Оперативные вмешательства по поводу варикозной болезни" },
    ],
  },
  [STEP_FOLLOWUP]: {
    id: STEP_FOLLOWUP,
    title: "Задать свой вопрос",
    question:
      "У вас есть уточняющий вопрос по теме менопаузы и МГТ? Можно написать свободно — ответит ИИ (не заменяет врача).",
    answerType: "text",
    helpText: "Можно оставить пустым — нажмите «Пропустить».",
  },
};

export const STEP_ORDER = [
  STEP_AGE,
  STEP_MENOPAUSE_AGE,
  STEP_HOT_FLASHES,
  STEP_VAGINAL_DRYNESS,
  STEP_DYSPAREUNIA,
  STEP_SEX_AVOIDANCE,
  STEP_GUMS,
  STEP_BODY,
  STEP_ENDOMETRIUM_USG,
  STEP_UNEXPLAINED_PAIN,
  STEP_MHT_ALLERGY,
  STEP_CANCERS_1,
  STEP_PORPHYRIA,
  STEP_ENDOMETRIOSIS,
  STEP_UNDIAGNOSED_BLEEDING,
  STEP_BREAST_CANCER_DETAIL,
  STEP_GYN_CANCER_DETAIL,
  STEP_LIVER,
  STEP_THROMBOSIS_CV,
  STEP_RISKS_1,
  STEP_ONCO_MONITORING,
  STEP_ONCO_NEGATIVE,
  STEP_LIPID,
  STEP_VARICOSE,
];
