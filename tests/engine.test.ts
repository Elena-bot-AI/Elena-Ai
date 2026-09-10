import { describe, it, expect } from "vitest";
import { advance, createInitialState } from "@/lib/engine/engine";
import { STEPS, STEP_ORDER } from "@/lib/engine/steps";

const fullAnswersNoContra: Record<string, any> = {
  [STEPS.age.id]: { type: "number", value: 51 },
  [STEPS.menopause_age.id]: { type: "number", value: 49 },
  [STEPS.hot_flashes.id]: { type: "boolean", value: true },
  [STEPS.vaginal_dryness.id]: { type: "boolean", value: true },
  [STEPS.dyspareunia.id]: { type: "boolean", value: false },
  [STEPS.sex_avoidance.id]: { type: "boolean", value: false },
  [STEPS.gums.id]: {
    type: "multi",
    value: { nocturia_gt1: true, stress_incontinence: false },
  },
  [STEPS.body.id]: {
    type: "object",
    value: { heightCm: 168, weightKg: 68, smoking: false, diabetes: false, physicalActivity: "moderate" },
  },
  [STEPS.endometrium_usg.id]: {
    type: "multi",
    value: { endometrial_hyperplasia: false, endometrial_polyp: false, submucosal_myoma: false },
  },
  [STEPS.unexplained_pain.id]: { type: "boolean", value: false },
  [STEPS.mht_allergy.id]: { type: "boolean", value: false },
  [STEPS.cancers_1.id]: {
    type: "multi",
    value: { breast_cancer: false, endometrial_cancer: false, ovarian_cancer: false, meningioma: false },
  },
  [STEPS.porphyria.id]: { type: "boolean", value: false },
  [STEPS.endometriosis.id]: {
    type: "multi",
    value: { endometrioma: false, infiltrative_endometriosis: false, bowel_endometriosis: false },
  },
  [STEPS.undiagnosed_bleeding.id]: { type: "boolean", value: false },
  [STEPS.breast_cancer_detail.id]: { type: "boolean", value: false },
  [STEPS.gyn_cancer_detail.id]: { type: "boolean", value: false },
  [STEPS.liver.id]: {
    type: "multi",
    value: { active_liver_disease: false, liver_mht_cancellation: false },
  },
  [STEPS.thrombosis_cv.id]: {
    type: "multi",
    value: { venous_thrombosis: false, dvt: false, pe: false, mi: false, ischemic_stroke: false, hemorrhagic_stroke: false },
  },
  [STEPS.risks_1.id]: {
    type: "multi",
    value: { migraine_without_aura: true, hypertension: true, smoking: false },
  },
  [STEPS.onco_monitoring.id]: {
    type: "multi",
    value: { thyroid_cancer: true },
  },
  [STEPS.onco_negative.id]: {
    type: "multi",
    value: {},
  },
  [STEPS.lipid.id]: {
    type: "multi",
    value: { high_cholesterol: true },
  },
  [STEPS.varicose.id]: {
    type: "multi",
    value: { varicose: true },
  },
};

function runSession(answers: Record<string, any>) {
  let s = createInitialState("test-1");
  let result = undefined as any;
  for (const id of STEP_ORDER) {
    if (result?.isFinal) break;
    const a = answers[id];
    if (!a) break;
    result = advance(s, a);
    s = result.newState;
  }
  return { state: s, verdict: result?.verdict, isFinal: result?.isFinal };
}

describe("Engine", () => {
  it("AC-1: возраст 51, менопауза 49 → физиологическая, окно открыто, стаж 2", () => {
    const { state } = runSession(fullAnswersNoContra);
    expect(state.menopauseType).toBe("physiologic");
    expect(state.menopauseDurationYears).toBe(2);
    expect(state.therapeuticWindowOpen).toBe(true);
  });

  it("AC-2: приливы=да → systemic_mht=true", () => {
    const { state } = runSession(fullAnswersNoContra);
    expect(state.indications.systemic_mht).toBe(true);
  });

  it("AC-3: РМЖ=да → isFinal=true + absolute + врач после осмотра", () => {
    const a = { ...fullAnswersNoContra };
    a[STEPS.cancers_1.id] = {
      type: "multi",
      value: { breast_cancer: true, endometrial_cancer: false, ovarian_cancer: false, meningioma: false },
    };
    const { verdict, isFinal } = runSession(a);
    expect(isFinal).toBe(true);
    expect(verdict?.hasAbsoluteContraindication).toBe(true);
    expect(verdict?.summary).toContain("абсолютные противопоказания");
    expect(verdict?.summary).toContain("только врач");
  });

  it("AC-4: Р щитовидки=да → упоминание онколога", () => {
    const { verdict } = runSession(fullAnswersNoContra);
    expect(verdict?.summary).toContain("онколог");
  });

  it("AC-5: детерминизм — две одинаковые сессии → теги равны", () => {
    const a = runSession(fullAnswersNoContra);
    const b = runSession(fullAnswersNoContra);
    expect(a.verdict?.tags.slice().sort()).toEqual(b.verdict?.tags.slice().sort());
    expect(a.verdict?.hasAbsoluteContraindication).toBe(b.verdict?.hasAbsoluteContraindication);
  });

  it("Ранняя менопауза (43 года) → сразу systemic_mht", () => {
    const a = { ...fullAnswersNoContra };
    a[STEPS.age.id] = { type: "number", value: 44 };
    a[STEPS.menopause_age.id] = { type: "number", value: 42 };
    a[STEPS.hot_flashes.id] = { type: "boolean", value: false };
    const { state } = runSession(a);
    expect(state.menopauseType).toBe("early");
    expect(state.indications.systemic_mht).toBe(true);
  });

  it("ПНЯ <40", () => {
    const a = { ...fullAnswersNoContra };
    a[STEPS.age.id] = { type: "number", value: 36 };
    a[STEPS.menopause_age.id] = { type: "number", value: 33 };
    const { state } = runSession(a);
    expect(state.menopauseType).toBe("poi");
    expect(state.indications.systemic_mht).toBe(true);
  });

  it("Окно закрыто: возраст 65, стаж 15", () => {
    const a = { ...fullAnswersNoContra };
    a[STEPS.age.id] = { type: "number", value: 65 };
    a[STEPS.menopause_age.id] = { type: "number", value: 50 };
    const { state } = runSession(a);
    expect(state.menopauseDurationYears).toBe(15);
    expect(state.therapeuticWindowOpen).toBe(false);
  });
});
