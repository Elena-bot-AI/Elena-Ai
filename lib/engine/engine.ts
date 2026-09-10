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

export { buildVerdict };
export type { Verdict, Indications };
