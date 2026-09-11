export type MenopauseType = "poi" | "early" | "physiologic" | "late" | "unknown";

export type YesNo = boolean;

export interface Indications {
  systemic_mht: boolean;
  local_mht: boolean;
  osteoporosis_prophylaxis: boolean;
}

export interface GumsSymptoms {
  frequent_painless: boolean;
  frequent_painful: boolean;
  difficult: boolean;
  nocturia_gt1: boolean;
  stress_incontinence: boolean;
  frequent_cystitis: boolean;
  vulvar_discomfort: boolean;
}

export interface AnamnesisBody {
  heightCm: number;
  weightKg: number;
  smoking: boolean;
  diabetes: boolean;
  physicalActivity: "low" | "moderate" | "high" | "unknown";
}

export interface AbsoluteContraindications {
  [key: string]: boolean;
  endometrial_hyperplasia: boolean;
  endometrial_polyp: boolean;
  submucosal_myoma: boolean;
  undiagnosed_abdominal_pain: boolean;
  mht_allergy: boolean;
  breast_cancer: boolean;
  endometrial_cancer: boolean;
  ovarian_cancer: boolean;
  meningioma: boolean;
  cutaneous_porphyria: boolean;
  endometrioma: boolean;
  infiltrative_endometriosis: boolean;
  bowel_endometriosis: boolean;
  undiagnosed_bleeding: boolean;
  breast_cancer_history_or_suspect: boolean;
  endometrial_ovarian_cervix_cancer_eval: boolean;
  active_liver_disease: boolean;
  liver_mht_cancellation: boolean;
  venous_thrombosis: boolean;
  dvt: boolean;
  pe: boolean;
  mi: boolean;
  ischemic_stroke: boolean;
  hemorrhagic_stroke: boolean;
}

export interface RiskFactors {
  [key: string]: boolean;
  migraine_with_aura: boolean;
  migraine_without_aura: boolean;
  thrombophilia: boolean;
  myoma_no_submucosal: boolean;
  adenomyosis: boolean;
  endometriosis_surgery_history: boolean;
  smoking: boolean;
  elevated_bp: boolean;
  hypertension: boolean;
  bp_medication: boolean;
  ibd: boolean;
  high_cholesterol: boolean;
  high_ldl: boolean;
  high_triglycerides: boolean;
  varicose: boolean;
  thrombophlebitis_history: boolean;
  varicose_surgery: boolean;
}

export interface OncoMonitoring {
  [key: string]: boolean;
  thyroid_cancer: boolean;
  colorectal_cancer: boolean;
  skin_basal_cell: boolean;
  melanoma_local: boolean;
  hematologic: boolean;
  renal_cancer: boolean;
  pancreatic_cancer: boolean;
  microprolactinoma: boolean;
  macroprolactinoma: boolean;
}

export interface OncoNegativeEffect {
  [key: string]: boolean;
  gastric_cancer: boolean;
  bladder_cancer: boolean;
  lung_cancer: boolean;
  melanoma_metastatic: boolean;
  brain_tumor: boolean;
}

export interface SessionState {
  sessionId: string;
  currentStepId: string;
  age?: number;
  menopauseStarted?: boolean;
  menopauseAge?: number;
  menopauseType: MenopauseType;
  menopauseDurationYears?: number;
  therapeuticWindowOpen?: boolean;
  hotFlashes: YesNo | null;
  vaginalDryness: YesNo | null;
  dyspareunia: YesNo | null;
  sexAvoidance: YesNo | null;
  gums: GumsSymptoms | null;
  body: AnamnesisBody | null;
  bmi?: number;
  indications: Indications;
  absoluteContraindications: AbsoluteContraindications;
  riskFactors: RiskFactors;
  oncoMonitoring: OncoMonitoring;
  oncoNegativeEffect: OncoNegativeEffect;
  hasAbsoluteContraindication: boolean;
  absoluteContraindicationReasons: string[];
  completedStepIds: string[];
  followupAsked: boolean;
}

export type Answer =
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "multi"; value: Record<string, boolean> }
  | { type: "object"; value: Record<string, unknown> }
  | { type: "text"; value: string };

export interface Option {
  key: string;
  label: string;
  hint?: string;
}

export interface Step {
  id: string;
  title: string;
  question: string;
  answerType: "number" | "boolean" | "multi" | "object" | "final" | "text";
  options?: Option[];
  objectSchema?: Record<string, { kind: "number" | "boolean" | "select"; label: string; options?: Option[] }>;
  helpText?: string;
  sensitive?: boolean;
}

export interface Verdict {
  isFinal: true;
  hasAbsoluteContraindication: boolean;
  absoluteContraindicationReasons: string[];
  indications: Indications;
  riskFactors: string[];
  oncoMonitoring: string[];
  oncoNegativeEffect: string[];
  summary: string;
  tags: string[];
}

export interface StepResult {
  newState: SessionState;
  nextStep?: Step;
  isFinal: boolean;
  verdict?: Verdict;
}
