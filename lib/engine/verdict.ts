import type { SessionState, Verdict, RiskFactors, OncoMonitoring, OncoNegativeEffect } from "@/types/bot";
import { STEP_FOLLOWUP } from "./steps";

const DISCLAIMER_FINAL =
  "Этот вывод носит предварительный характер и не заменяет очную консультацию врача. Решение о возможности проведения терапии, выбор препаратов, режимов использования и дозирования, мониторинг терапии осуществляется врачом после проведения осмотра, оценки данных анамнеза и клинико-лабораторных исследований.";

const ABSOLUTE_CONTRA_HEADING =
  "На основании предварительного тестирования у вас имеются абсолютные противопоказания к назначению системной МГТ / ЗГТ. Окончательное заключение может вынести только врач после проведения осмотра и оценки данных анамнеза и результатов клинико-лабораторных исследований.";

const OK_HEADING =
  "На основании предварительного тестирования у вас отсутствуют абсолютные противопоказания для назначения системной МГТ / ЗГТ.";

const ONCO_MONITORING_PHRASE =
  "Требуется тщательная оценка течения заболевания совместно с профильным специалистом-онкологом для принятия взвешенного решения о проведении МГТ / ЗГТ.";

const ONCO_NEGATIVE_PHRASE =
  "При наличии перечисленных онкологических заболеваний в анамнезе МГТ / ЗГТ может оказывать неблагоприятное воздействие на течение процесса. Требуется консилиум: профильный онколог + гинеколог-эндокринолог.";

export function buildVerdict(s: SessionState): Verdict {
  const tags: string[] = [];
  const indications = s.indications;

  if (indications.systemic_mht) tags.push("systemic_mht");
  if (indications.local_mht) tags.push("local_mht");
  if (indications.osteoporosis_prophylaxis) tags.push("osteoporosis_prophylaxis");

  const riskLabels = collectLabelsFromObj(
    s.riskFactors as Record<string, boolean>,
    RISK_FACTOR_LABELS,
  );
  const oncoM = collectLabelsFromObj(s.oncoMonitoring as Record<string, boolean>, ONCO_MONITORING_LABELS);
  const oncoN = collectLabelsFromObj(s.oncoNegativeEffect as Record<string, boolean>, ONCO_NEGATIVE_LABELS);

  const paragraphs: string[] = [];

  if (s.hasAbsoluteContraindication) {
    paragraphs.push(ABSOLUTE_CONTRA_HEADING);
    if (s.absoluteContraindicationReasons.length > 0) {
      paragraphs.push("Выявленные абсолютные противопоказания:\n• " + s.absoluteContraindicationReasons.join("\n• "));
    }
    tags.push("absolute_contraindication");
  } else {
    paragraphs.push(OK_HEADING);
  }

  const menopauseInfo = formatMenopause(s);
  if (menopauseInfo) paragraphs.push(menopauseInfo);

  if (!s.hasAbsoluteContraindication) {
    const indicationsBlock = formatIndications(s);
    if (indicationsBlock) paragraphs.push(indicationsBlock);
  }

  if (riskLabels.length > 0) {
    paragraphs.push("Факторы риска, которые требуют внимания врача (не являются абсолютными противопоказаниями):\n• " + riskLabels.join("\n• "));
    tags.push("has_risk_factors");
  }

  if (oncoM.length > 0) {
    paragraphs.push("Онкологические заболевания в анамнезе, требующие мониторинга:\n• " + oncoM.join("\n• "));
    paragraphs.push(ONCO_MONITORING_PHRASE);
    tags.push("onco_monitoring");
  }
  if (oncoN.length > 0) {
    paragraphs.push("Онкологические заболевания в анамнезе, при которых МГТ/ЗГТ может оказывать неблагоприятное действие:\n• " + oncoN.join("\n• "));
    paragraphs.push(ONCO_NEGATIVE_PHRASE);
    tags.push("onco_negative_effect");
  }

  paragraphs.push(DISCLAIMER_FINAL);

  const summary = paragraphs.join("\n\n");

  return {
    isFinal: true,
    hasAbsoluteContraindication: s.hasAbsoluteContraindication,
    absoluteContraindicationReasons: s.absoluteContraindicationReasons,
    indications,
    riskFactors: riskLabels,
    oncoMonitoring: oncoM,
    oncoNegativeEffect: oncoN,
    summary,
    tags,
  };
}

function collectLabelsFromObj(obj: Record<string, boolean>, labels: Record<string, string>): string[] {
  return Object.keys(obj)
    .filter((k) => obj[k])
    .map((k) => labels[k] || k);
}

function formatMenopause(s: SessionState): string | null {
  if (!Number.isFinite(s.age) || !Number.isFinite(s.menopauseAge)) return null;
  const typePlain: Record<string, string> = {
    poi: "Преждевременная менопауза / ПНЯ",
    early: "Ранняя менопауза",
    physiologic: "Физиологическая менопауза",
    late: "Поздняя менопауза",
    unknown: "Не определено",
  };
  const typeWithIndication: Record<string, string> = {
    poi: "Преждевременная менопауза / ПНЯ (абсолютное показание к ЗГТ)",
    early: "Ранняя менопауза (абсолютное показание к ЗГТ)",
    physiologic: "Физиологическая менопауза",
    late: "Поздняя менопауза",
    unknown: "Не определено",
  };
  const typeMap = s.hasAbsoluteContraindication ? typePlain : typeWithIndication;
  const t = typeMap[s.menopauseType] ?? typePlain.unknown;

  const window = s.hasAbsoluteContraindication
    ? ""
    : s.therapeuticWindowOpen === true
      ? "Окно терапевтических возможностей ✅ открыто: возраст ≤ 60 лет ИЛИ стаж менопаузы ≤ 10 лет."
      : s.therapeuticWindowOpen === false
        ? "Окно терапевтических возможностей ⚠️ закрыто: возраст > 60 лет И стаж менопаузы > 10 лет."
        : "";
  const lines = [
    `Ваш возраст: ${s.age} лет. Возраст наступления менопаузы: ${s.menopauseAge} лет. Стаж менопаузы: ${s.menopauseDurationYears ?? 0} лет.`,
    t,
  ];
  if (window) lines.push(window);
  if (typeof s.bmi === "number") {
    lines.push(`ИМТ: ${s.bmi.toFixed(2)} кг/м² (${bmiCategory(s.bmi)}).`);
  }
  return lines.join("\n");
}

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "недостаточная масса";
  if (bmi < 25) return "норма";
  if (bmi < 30) return "избыточная масса";
  if (bmi < 35) return "ожирение I степени";
  if (bmi < 40) return "ожирение II степени";
  return "ожирение III степени";
}

function formatIndications(s: SessionState): string | null {
  const ind = s.indications;
  const items: string[] = [];
  if (ind.systemic_mht)
    items.push(
      "Показания к СИСТЕМНОЙ МГТ / ЗГТ: наличие вазомоторных симптомов (приливы жара, нарушающие качество жизни), и/или абсолютные показания (ПНЯ / ранняя менопауза), и/или сочетание симптомов.",
    );
  if (ind.local_mht)
    items.push(
      "Показания к ТОПИЧЕСКОЙ (местной) гормональной терапии: симптомы ГУМС (сухость, боль при половых контактах, отказ от половой жизни, мочевые симптомы, дискомфорт вульвы). При сочетании с вазомоторными симптомами — системная терапия предпочтительна.",
    );
  if (ind.osteoporosis_prophylaxis)
    items.push(
      "Профилактика постменопаузального остеопороза: подходит практически любой женщине в менопаузе, т.к. менопауза сопровождается снижением минеральной плотности костной ткани. Особенно актуальна при ожирении, курении, низкой физической активности.",
    );
  if (items.length === 0) return null;
  return "Показания:\n• " + items.join("\n• ");
}

export function isFollowupStep(s: SessionState) {
  return s.currentStepId === STEP_FOLLOWUP;
}

export const RISK_FACTOR_LABELS: Record<keyof RiskFactors, string> = {
  migraine_with_aura: "Мигрень с аурой",
  migraine_without_aura: "Мигрень без ауры",
  thrombophilia: "Генетическая тромбофилия высокого риска",
  myoma_no_submucosal: "Миома матки без субмукозных узлов",
  adenomyosis: "Эндометриоз матки (аденомиоз)",
  endometriosis_surgery_history: "Операции по поводу эндометриоза в анамнезе",
  smoking: "Курение",
  elevated_bp: "Повышение артериального давления",
  hypertension: "Гипертоническая болезнь",
  bp_medication: "Приём антигипертензивных препаратов",
  ibd: "Воспалительные заболевания кишечника (ЯК, БК, дивертикулит)",
  high_cholesterol: "Повышенный общий холестерин",
  high_ldl: "Повышенный ЛПНП",
  high_triglycerides: "Повышенные триглицериды",
  varicose: "Варикозная болезнь вен нижних конечностей",
  thrombophlebitis_history: "Тромбофлебит в анамнезе",
  varicose_surgery: "Операции по поводу варикозной болезни",
};

export const ONCO_MONITORING_LABELS: Record<keyof OncoMonitoring, string> = {
  thyroid_cancer: "Рак щитовидной железы",
  colorectal_cancer: "Колоректальный рак",
  skin_basal_cell: "Базалиома / рак кожи",
  melanoma_local: "Меланома кожи (локальная)",
  hematologic: "Гематологические раки (лимфома, лейкемия)",
  renal_cancer: "Рак почек",
  pancreatic_cancer: "Рак поджелудочной железы",
  microprolactinoma: "Микропролактинома",
  macroprolactinoma: "Макропролактинома",
};

export const ONCO_NEGATIVE_LABELS: Record<keyof OncoNegativeEffect, string> = {
  gastric_cancer: "Рак желудка",
  bladder_cancer: "Рак мочевого пузыря",
  lung_cancer: "Рак лёгких",
  melanoma_metastatic: "Распространённая метастатическая меланома",
  brain_tumor: "Опухоль головного мозга",
};
