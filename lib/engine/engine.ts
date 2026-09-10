import type {
  SessionState,
  Answer,
  StepResult,
  Indications,
  AbsoluteContraindications,
  RiskFactors,
  OncoMonitoring,
  OncoNegativeEffect,
  GumsSymptoms,
  AnamnesisBody,
  Verdict,
  YesNo,
} from "@/types/bot";
import { STEP_ORDER, STEPS, STEP_AGE, STEP_MENOPAUSE_AGE, STEP_FINAL, STEP_FOLLOWUP } from "./steps";
import { buildVerdict } from "./verdict";

export function createInitialState(sessionId: string): SessionState {
  return {
    sessionId,
    currentStepId: STEP_ORDER[0],
    menopauseType: "unknown",
    hotFlashes: null,
    vaginalDryness: null,
    dyspareunia: null,
    sexAvoidance: null,
    gums: null,
    body: null,
    indications: { systemic_mht: false, local_mht: false, osteoporosis_prophylaxis: false },
    absoluteContraindications: emptyObj<AbsoluteContraindications>(),
    riskFactors: emptyObj<RiskFactors>(),
    oncoMonitoring: emptyObj<OncoMonitoring>(),
    oncoNegativeEffect: emptyObj<OncoNegativeEffect>(),
    hasAbsoluteContraindication: false,
    absoluteContraindicationReasons: [],
    completedStepIds: [],
    followupAsked: false,
  };
}

function emptyObj<T extends Record<string, boolean>>(): T {
  return Object.create(null) as T;
}

export function getFirstStep() {
  return STEPS[STEP_ORDER[0]];
}

export function advance(state: SessionState, answer: Answer): StepResult {
  let s: SessionState = { ...state, completedStepIds: [...state.completedStepIds, state.currentStepId] };
  let absoluteHit = false;
  let absoluteReasons: string[] = [];

  switch (s.currentStepId) {
    case STEP_AGE: {
      s.age = asNumber(answer);
      break;
    }
    case STEP_MENOPAUSE_AGE: {
      s.menopauseAge = asNumber(answer);
      if (typeof s.age === "number" && typeof s.menopauseAge === "number") {
        s.menopauseDurationYears = Math.max(0, s.age - s.menopauseAge);
        s.menopauseType = computeMenopauseType(s.menopauseAge);
        s.therapeuticWindowOpen = computeWindow(s.age, s.menopauseDurationYears);
        if (s.menopauseType === "poi" || s.menopauseType === "early") {
          s.indications.systemic_mht = true;
        }
      }
      break;
    }
    case STEPS.hot_flashes.id: {
      s.hotFlashes = asBoolean(answer) as YesNo;
      if (s.hotFlashes) s.indications.systemic_mht = true;
      break;
    }
    case STEPS.vaginal_dryness.id: {
      s.vaginalDryness = asBoolean(answer) as YesNo;
      if (s.vaginalDryness) s.indications.local_mht = true;
      break;
    }
    case STEPS.dyspareunia.id: {
      s.dyspareunia = asBoolean(answer) as YesNo;
      if (s.dyspareunia) s.indications.local_mht = true;
      break;
    }
    case STEPS.sex_avoidance.id: {
      s.sexAvoidance = asBoolean(answer) as YesNo;
      if (s.sexAvoidance) s.indications.local_mht = true;
      break;
    }
    case STEPS.gums.id: {
      const m = asMulti(answer);
      s.gums = {
        frequent_painless: !!m.frequent_painless,
        frequent_painful: !!m.frequent_painful,
        difficult: !!m.difficult,
        nocturia_gt1: !!m.nocturia_gt1,
        stress_incontinence: !!m.stress_incontinence,
        frequent_cystitis: !!m.frequent_cystitis,
        vulvar_discomfort: !!m.vulvar_discomfort,
      } as GumsSymptoms;
      if (Object.values(s.gums).some(Boolean)) s.indications.local_mht = true;
      break;
    }
    case STEPS.body.id: {
      const obj = asObject(answer);
      const heightCm = Number(obj.heightCm);
      const weightKg = Number(obj.weightKg);
      const smoking = !!obj.smoking;
      const diabetes = !!obj.diabetes;
      const physicalActivity = (obj.physicalActivity as AnamnesisBody["physicalActivity"]) || "unknown";
      s.body = { heightCm, weightKg, smoking, diabetes, physicalActivity };
      if (heightCm > 0 && weightKg > 0) {
        s.bmi = round2(weightKg / Math.pow(heightCm / 100, 2));
      }
      s.indications.osteoporosis_prophylaxis = true;
      s.riskFactors.smoking = smoking || s.riskFactors.smoking;
      break;
    }
    case STEPS.endometrium_usg.id: {
      const m = asMulti(answer);
      applyAbsoluteMulti(s, s.absoluteContraindications, m, [
        ["endometrial_hyperplasia", "Гиперплазия эндометрия"],
        ["endometrial_polyp", "Полип эндометрия"],
        ["submucosal_myoma", "Субмукозная миома матки"],
      ]);
      break;
    }
    case STEPS.unexplained_pain.id: {
      const v = asBoolean(answer);
      s.absoluteContraindications.undiagnosed_abdominal_pain = v;
      if (v) pushReason(s, "Неопределённые боли в животе неустановленной причины");
      break;
    }
    case STEPS.mht_allergy.id: {
      const v = asBoolean(answer);
      s.absoluteContraindications.mht_allergy = v;
      if (v) pushReason(s, "Аллергическая реакция на препараты МГТ/ЗГТ");
      break;
    }
    case STEPS.cancers_1.id: {
      const m = asMulti(answer);
      applyAbsoluteMulti(s, s.absoluteContraindications, m, [
        ["breast_cancer", "Установленный рак молочной железы"],
        ["endometrial_cancer", "Установленный рак эндометрия"],
        ["ovarian_cancer", "Установленный рак яичников"],
        ["meningioma", "Менингиома"],
      ]);
      break;
    }
    case STEPS.porphyria.id: {
      const v = asBoolean(answer);
      s.absoluteContraindications.cutaneous_porphyria = v;
      if (v) pushReason(s, "Кожная порфирия");
      break;
    }
    case STEPS.endometriosis.id: {
      const m = asMulti(answer);
      applyAbsoluteMulti(s, s.absoluteContraindications, m, [
        ["endometrioma", "Эндометриоидная киста яичника"],
        ["infiltrative_endometriosis", "Инфильтративный эндометриоз"],
        ["bowel_endometriosis", "Эндометриоз кишечника"],
      ]);
      break;
    }
    case STEPS.undiagnosed_bleeding.id: {
      const v = asBoolean(answer);
      s.absoluteContraindications.undiagnosed_bleeding = v;
      if (v) pushReason(s, "Кровотечения из половых путей неустановленной причины");
      break;
    }
    case STEPS.breast_cancer_detail.id: {
      const v = asBoolean(answer);
      s.absoluteContraindications.breast_cancer_history_or_suspect = v;
      if (v) pushReason(s, "РМЖ в анамнезе / лечении / подозрении");
      break;
    }
    case STEPS.gyn_cancer_detail.id: {
      const v = asBoolean(answer);
      s.absoluteContraindications.endometrial_ovarian_cervix_cancer_eval = v;
      if (v) pushReason(s, "Рак эндометрия/яичников/шейки в стадии обследования или лечения");
      break;
    }
    case STEPS.liver.id: {
      const m = asMulti(answer);
      applyAbsoluteMulti(s, s.absoluteContraindications, m, [
        ["active_liver_disease", "Активные заболевания печени (гепатит, цирроз, опухоли, недостаточность, метастазы)"],
        ["liver_mht_cancellation", "Отмена МГТ в прошлом из-за тяжёлых нарушений функции печени"],
      ]);
      break;
    }
    case STEPS.thrombosis_cv.id: {
      const m = asMulti(answer);
      applyAbsoluteMulti(s, s.absoluteContraindications, m, [
        ["venous_thrombosis", "Тромбоз периферических вен"],
        ["dvt", "Тромбоз глубоких вен"],
        ["pe", "Тромбоэмболия лёгочной артерии"],
        ["mi", "Инфаркт миокарда"],
        ["ischemic_stroke", "Ишемический инсульт"],
        ["hemorrhagic_stroke", "Геморрагический инсульт"],
      ]);
      break;
    }
    case STEPS.risks_1.id: {
      const m = asMulti(answer);
      for (const key of Object.keys(m) as (keyof RiskFactors)[]) {
        if (m[key]) s.riskFactors[key] = true;
      }
      break;
    }
    case STEPS.onco_monitoring.id: {
      const m = asMulti(answer);
      for (const key of Object.keys(m) as (keyof OncoMonitoring)[]) {
        if (m[key]) s.oncoMonitoring[key] = true;
      }
      break;
    }
    case STEPS.onco_negative.id: {
      const m = asMulti(answer);
      for (const key of Object.keys(m) as (keyof OncoNegativeEffect)[]) {
        if (m[key]) s.oncoNegativeEffect[key] = true;
      }
      break;
    }
    case STEPS.lipid.id: {
      const m = asMulti(answer);
      (Object.keys(m) as (keyof RiskFactors)[]).forEach((k) => {
        if (m[k]) s.riskFactors[k] = true;
      });
      break;
    }
    case STEPS.varicose.id: {
      const m = asMulti(answer);
      (Object.keys(m) as (keyof RiskFactors)[]).forEach((k) => {
        if (m[k]) s.riskFactors[k] = true;
      });
      break;
    }
    case STEP_FOLLOWUP: {
      s.followupAsked = true;
      break;
    }
  }

  if (s.absoluteContraindicationReasons.length > 0) {
    s.hasAbsoluteContraindication = true;
  }

  if (s.hasAbsoluteContraindication) {
    const verdict = buildVerdict(s);
    return { newState: { ...s, currentStepId: STEP_FINAL }, isFinal: true, verdict };
  }

  const currentIndex = STEP_ORDER.indexOf(s.currentStepId);
  const nextId = currentIndex >= 0 ? STEP_ORDER[currentIndex + 1] : undefined;
  if (!nextId) {
    const verdict = buildVerdict(s);
    return { newState: { ...s, currentStepId: STEP_FINAL }, isFinal: true, verdict };
  }

  s.currentStepId = nextId;
  return { newState: s, nextStep: STEPS[nextId], isFinal: false };
}

export function asNumber(a: Answer): number {
  if (a.type === "number") return a.value;
  const n = Number(a.type === "text" ? a.value : String((a as any).value ?? ""));
  return Number.isFinite(n) ? n : NaN;
}
export function asBoolean(a: Answer): boolean {
  if (a.type === "boolean") return a.value;
  if (a.type === "number") return a.value !== 0;
  const v = (a as any).value;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "да" || s === "y" || s === "yes" || s === "true" || s === "1";
  }
  return Boolean(v);
}
export function asMulti(a: Answer): Record<string, boolean> {
  if (a.type === "multi") return a.value;
  if (a.type === "object") return a.value as Record<string, boolean>;
  return {};
}
export function asObject(a: Answer): Record<string, unknown> {
  if (a.type === "object") return a.value;
  return {};
}
export function asText(a: Answer): string {
  if (a.type === "text") return a.value;
  return String((a as any).value ?? "");
}

function computeMenopauseType(ma: number) {
  if (!Number.isFinite(ma)) return "unknown";
  if (ma < 40) return "poi";
  if (ma <= 44) return "early";
  if (ma <= 54) return "physiologic";
  return "late";
}
function computeWindow(age: number, duration: number) {
  return age <= 60 || duration <= 10;
}
function pushReason(s: SessionState, reason: string) {
  s.absoluteContraindicationReasons.push(reason);
}
function applyAbsoluteMulti(
  s: SessionState,
  target: Record<string, boolean>,
  multi: Record<string, boolean>,
  mapping: [key: string, label: string][],
) {
  for (const [key, label] of mapping) {
    if (multi[key]) {
      target[key] = true;
      pushReason(s, label);
    }
  }
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function yn(v: YesNo | boolean | null | undefined): string {
  if (v === null || v === undefined) return "";
  return v === true ? "Да" : "Нет";
}

function labelListTrue(target: Record<string, boolean>, mapping: [string, string][]): string {
  const labels: string[] = [];
  for (const [k, lbl] of mapping) if (target[k]) labels.push(lbl);
  if (labels.length === 0) return "Нет";
  return labels.join(", ");
}

/**
 * Преобразует SessionState в 24 человекочитаемых ответа (по порядку STEP_ORDER).
 * Ключи = stepId (age, menopause_age, ..., varicose), значения = строки для Гугл-таблицы.
 */
export function sessionToFlat24Answers(s: SessionState): Record<string, string> {
  const r: Record<string, string> = {};

  r["age"] = typeof s.age === "number" ? String(s.age) : "";
  r["menopause_age"] = typeof s.menopauseAge === "number" ? String(s.menopauseAge) : "";
  r["hot_flashes"] = yn(s.hotFlashes);
  r["vaginal_dryness"] = yn(s.vaginalDryness);
  r["dyspareunia"] = yn(s.dyspareunia);
  r["sex_avoidance"] = yn(s.sexAvoidance);

  if (s.gums) {
    r["gums"] = labelListTrue(s.gums as unknown as Record<string, boolean>, [
      ["frequent_painless", "Учащённое безболезненное мочеиспускание"],
      ["frequent_painful", "Учащённое болезненное мочеиспускание (цистит)"],
      ["difficult", "Затруднённое мочеиспускание"],
      ["nocturia_gt1", "Ноктурия >1 раза"],
      ["stress_incontinence", "Стрессовое недержание мочи"],
      ["frequent_cystitis", "Частые циститы"],
      ["vulvar_discomfort", "Дискомфорт вульвы/зуд/жжение/сухость"],
    ]);
  } else {
    r["gums"] = "";
  }

  if (s.body) {
    const b = s.body;
    const actMap: Record<string, string> = { low: "Низкая", moderate: "Умеренная", high: "Высокая" };
    const pieces = [
      typeof b.heightCm === "number" ? `Рост ${b.heightCm}` : "",
      typeof b.weightKg === "number" ? `Вес ${b.weightKg}` : "",
      typeof s.bmi === "number" ? `ИМТ ${s.bmi}` : "",
      b.smoking === true ? "Курит" : b.smoking === false ? "Не курит" : "",
      b.diabetes === true ? "Сахарный диабет" : b.diabetes === false ? "СД: нет" : "",
      typeof b.physicalActivity === "string" ? `Активность: ${actMap[b.physicalActivity] || b.physicalActivity}` : "",
    ].filter(Boolean);
    r["body"] = pieces.join(" / ");
  } else {
    r["body"] = "";
  }

  r["endometrium_usg"] = labelListTrue(s.absoluteContraindications, [
    ["endometrial_hyperplasia", "Гиперплазия эндометрия"],
    ["endometrial_polyp", "Полип эндометрия"],
    ["submucosal_myoma", "Субмукозная миома"],
  ]);
  r["unexplained_pain"] = yn(s.absoluteContraindications.unexplained_abdominal_pain);
  r["mht_allergy"] = yn(s.absoluteContraindications.mht_hypersensitivity);
  r["cancers_1"] = labelListTrue(s.absoluteContraindications, [
    ["breast_cancer_current", "Текущий РМЖ"],
    ["breast_cancer_history", "Анамнез РМЖ"],
    ["endometrial_cancer", "Рак эндометрия"],
    ["gyn_cancer", "Иные гинекологические опухоли"],
  ]);
  r["porphyria"] = yn(s.absoluteContraindications.hepatic_porphyria);
  r["endometriosis"] = yn(s.absoluteContraindications.endometriosis);
  r["undiagnosed_bleeding"] = yn(s.absoluteContraindications.undiagnosed_genital_bleeding);
  r["breast_cancer_detail"] = yn(s.oncoMonitoring.breast_cancer_monitoring);
  r["gyn_cancer_detail"] = yn(s.oncoMonitoring.gyn_onco_monitoring);
  r["liver"] = labelListTrue(s.absoluteContraindications, [
    ["active_liver_disease", "Активное заболевание печени"],
    ["liver_tumors", "Опухоли печени"],
  ]);
  r["thrombosis_cv"] = labelListTrue(s.absoluteContraindications, [
    ["vt_history", "ВТ/ТЭЛА анамнез"],
    ["vt_current", "Острый ВТ/ТЭЛА"],
    ["cvd", "ИБС/инфаркт/инсульт"],
    ["uncontrolled_hypertension", "Неконтролируемая АГ"],
  ]);
  r["risks_1"] = labelListTrue(s.riskFactors, [
    ["early_menopause_age", "Ранняя менопауза"],
    ["low_bmd_or_fracture", "Остеопения/переломы"],
    ["family_breast_cancer", "Семейный РМЖ"],
    ["dyslipidemia", "Дислипидемия"],
    ["hypertension_controlled", "Контролируемая АГ"],
    ["diabetes_type_2", "СД 2 типа"],
    ["varicose_veins", "Варикоз вен"],
    ["migraine_with_aura", "Мигрень с аурой"],
  ]);
  r["onco_monitoring"] = labelListTrue(s.oncoMonitoring, [
    ["breast_cancer_monitoring", "РМЖ наблюдение"],
    ["gyn_onco_monitoring", "Гин. онко наблюдение"],
  ]);
  r["onco_negative"] = labelListTrue(s.oncoNegativeEffect, [
    ["endometrial_cancer_risk", "Риск РЭ (МГТ без гестагена)"],
    ["breast_cancer_risk_5yr", "Риск РМЖ (системная МГТ>5л)"],
    ["vt_risk_first_year", "Риск ВТ первый год"],
  ]);
  r["lipid"] = yn(s.riskFactors.dyslipidemia);
  r["varicose"] = yn(s.riskFactors.varicose_veins);

  return r;
}

export { buildVerdict };
export type { Verdict, Indications };
