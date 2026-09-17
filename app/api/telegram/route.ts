import { NextRequest, NextResponse } from "next/server";
import { handleUpdate } from "@/lib/telegram/bot-instance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function constantTimeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

function tgSecretOk(req: NextRequest): { ok: boolean; debug: string } {
  const bypass =
    process.env.TELEGRAM_BYPASS_SECURITY === "1" ||
    process.env.TELEGRAM_BYPASS_SECURITY === "true";
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  const headerSecret =
    req.headers.get("X-Telegram-Bot-Api-Secret-Token") ||
    req.headers.get("x-telegram-bot-api-secret-token");
  const urlSecret = new URL(req.url).searchParams.get("secret");
  const got = (headerSecret && headerSecret.trim()) || (urlSecret && urlSecret.trim()) || "";

  let matched = false;
  let reason = "";
  if (bypass) {
    matched = true;
    reason = "BYPASS_TELEGRAM_SECURITY";
  } else if (!expected || expected.trim().length < 16) {
    matched = false;
    reason = "EXPECTED_TOO_SHORT_OR_EMPTY";
  } else {
    matched = constantTimeEq(expected.trim(), got);
    reason = matched ? "MATCHED" : "MISMATCH";
  }
  const debug = [
    `bypass=${bypass ? 1 : 0}`,
    `expectedLen=${expected.length}`,
    `gotPresent=${got ? 1 : 0}`,
    `headerPresent=${headerSecret ? 1 : 0}`,
    `urlSecretPresent=${urlSecret ? 1 : 0}`,
    `result=${reason}`,
  ].join(" ");
  console.warn("[telegram_webhook_auth]", debug);
  return { ok: matched, debug };
}

export async function POST(req: NextRequest, _ctx: { params: { slug?: string[] } }) {
  const auth = tgSecretOk(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: "unauthorized", debug: auth.debug },
      { status: 401 },
    );
  }
  try {
    const update = await req.json();
    const res = await handleUpdate({
      json: () => Promise.resolve(update),
      method: "POST",
      headers: { get: () => "application/json" },
    } as any);
    return new NextResponse(res.body, {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
    });
  } catch (err: any) {
    console.error("tg webhook error", err);
    return NextResponse.json({ ok: false, error: err?.message || "error" }, { status: 500 });
  }
}
