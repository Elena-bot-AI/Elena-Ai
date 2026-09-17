import { NextRequest, NextResponse } from "next/server";
import type { Answer } from "@/types/bot";
import { advance, getFirstStep, asText } from "@/lib/engine/engine";
import { STEPS } from "@/lib/engine/steps";
import { getSession, setSession } from "@/lib/engine/sessions";
import { paraphraseVerdict, answerFollowup, isLlmAvailable } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authOk(req: NextRequest): { ok: boolean; debug: string } {
  const bypass =
    process.env.SALEBOT_BYPASS_SECURITY === "1" ||
    process.env.SALEBOT_BYPASS_SECURITY === "true";
  const expected = process.env.SALEBOT_SECRET || "";
  const got = req.headers.get("X-Salebot-Secret") || req.headers.get("x-salebot-secret") || "";
  let matched = false;
  let reason = "";
  if (bypass) {
    matched = true;
    reason = "BYPASS";
  } else if (!expected || expected.trim().length < 16) {
    matched = false;
    reason = "EXPECTED_TOO_SHORT_OR_EMPTY";
  } else {
    const a = Buffer.from(expected.trim());
    const b = Buffer.from(got);
    let diff = 0;
    if (a.length !== b.length) diff |= 1;
    const L = Math.min(a.length, b.length);
    for (let i = 0; i < L; i++) diff |= a[i] ^ b[i];
    matched = diff === 0;
    reason = matched ? "MATCHED" : "MISMATCH";
  }
  const debug = [
    `bypass=${bypass ? 1 : 0}`,
    `expectedLen=${expected.length}`,
    `gotPresent=${got ? 1 : 0}`,
    `result=${reason}`,
  ].join(" ");
  console.warn("[salebot_auth]", debug);
  return { ok: matched, debug };
}

type StepRequest = {
  sessionId: string;
  stepId?: string;
  answer?:
    | { type: "number"; value: number }
    | { type: "boolean"; value: boolean }
    | { type: "multi"; value: Record<string, boolean> }
    | { type: "object"; value: Record<string, unknown> }
    | { type: "text"; value: string }
    | number
    | boolean
    | string
    | Record<string, boolean>
    | Record<string, unknown>
    | null;
  useLlm?: boolean;
  followupQuestion?: string;
};

function normalizeAnswer(raw: StepRequest["answer"]): Answer | null {
  if (raw == null) return null;
  if (typeof raw === "number") return { type: "number", value: raw };
  if (typeof raw === "boolean") return { type: "boolean", value: raw };
  if (typeof raw === "string") {
    if (["да", "нет", "true", "false", "yes", "no", "1", "0"].includes(raw.toLowerCase())) {
      const v = ["да", "true", "yes", "1"].includes(raw.toLowerCase());
      return { type: "boolean", value: v };
    }
    if (/^-?\d+(\.\d+)?$/.test(raw)) return { type: "number", value: parseFloat(raw) };
    return { type: "text", value: raw };
  }
  if (typeof raw === "object") {
    const r = raw as any;
    if (r.type) {
      if (r.type === "number") return { type: "number", value: Number(r.value) };
      if (r.type === "boolean") return { type: "boolean", value: !!r.value };
      if (r.type === "multi") return { type: "multi", value: r.value || {} };
      if (r.type === "object") return { type: "object", value: r.value || {} };
      if (r.type === "text") return { type: "text", value: String(r.value || "") };
    }
    const values = Object.values(r as Record<string, unknown>);
    if (values.length > 0 && values.every((v) => typeof v === "boolean")) {
      return { type: "multi", value: r as Record<string, boolean> };
    }
    return { type: "object", value: r };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const auth = authOk(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "unauthorized", debug: auth.debug }, { status: 401 });
  }
  let body: StepRequest;
  try {
    body = (await req.json()) as StepRequest;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body?.sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const state = getSession(body.sessionId);

  if (body.stepId && body.stepId !== state.currentStepId) {
    // allow client sync
  }

  const firstTime = state.completedStepIds.length === 0 && !body.answer && !body.followupQuestion;
  if (firstTime) {
    const s = getFirstStep();
    return NextResponse.json({
      sessionId: body.sessionId,
      nextStepId: s.id,
      question: s.question,
      title: s.title,
      answerType: s.answerType,
      options: s.options || null,
      objectSchema: (s as any).objectSchema || null,
      helpText: s.helpText || null,
      isFinal: false,
    });
  }

  if (body.followupQuestion || state.currentStepId === "followup") {
    const q = body.followupQuestion || (body.answer ? asText(normalizeAnswer(body.answer) as any) : "");
    const verdictLike = (state as any)._lastSummary || "";
    const reply = q ? await answerFollowup(q, verdictLike || "нет данных") : "";
    return NextResponse.json({
      sessionId: body.sessionId,
      isFinal: true,
      followupReply: reply,
      llmUsed: isLlmAvailable(),
      question: "Спасибо! Если есть ещё вопросы — обязательно обсудите их с врачом на приёме.",
    });
  }

  const answer = normalizeAnswer(body.answer);
  if (!answer) {
    const s = STEPS[state.currentStepId];
    return NextResponse.json({
      sessionId: body.sessionId,
      nextStepId: s.id,
      question: s.question,
      title: s.title,
      answerType: s.answerType,
      options: s.options || null,
      objectSchema: (s as any).objectSchema || null,
      helpText: s.helpText || null,
      isFinal: false,
    });
  }

  const result = advance(state, answer);
  setSession(body.sessionId, result.newState);

  let summary = result.verdict?.summary || null;
  if (result.isFinal && result.verdict && body.useLlm !== false) {
    summary = await paraphraseVerdict(result.verdict.summary);
    (result.newState as any)._lastSummary = summary;
    setSession(body.sessionId, result.newState);
  }

  if (result.isFinal) {
    return NextResponse.json({
      sessionId: body.sessionId,
      nextStepId: "final",
      isFinal: true,
      summary,
      verdict: result.verdict,
      followupAvailable: true,
    });
  }

  const next = result.nextStep!;
  return NextResponse.json({
    sessionId: body.sessionId,
    nextStepId: next.id,
    question: next.question,
    title: next.title,
    answerType: next.answerType,
    options: next.options || null,
    objectSchema: (next as any).objectSchema || null,
    helpText: next.helpText || null,
    isFinal: false,
  });
}
