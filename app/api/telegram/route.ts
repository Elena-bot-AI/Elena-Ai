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

function tgSecretOk(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || expected.trim().length < 16) return false;
  const headerSecret =
    req.headers.get("X-Telegram-Bot-Api-Secret-Token") ||
    req.headers.get("x-telegram-bot-api-secret-token");
  const urlSecret = new URL(req.url).searchParams.get("secret");
  const got = (headerSecret && headerSecret.trim()) || (urlSecret && urlSecret.trim()) || "";
  return constantTimeEq(expected, got);
}

export async function POST(req: NextRequest, _ctx: { params: { slug?: string[] } }) {
  if (!tgSecretOk(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
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
