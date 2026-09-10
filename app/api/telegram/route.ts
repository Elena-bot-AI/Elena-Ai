import { NextRequest, NextResponse } from "next/server";
import { handleUpdate } from "@/lib/telegram/bot-instance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req: NextRequest, _ctx: { params: { slug?: string[] } }) {
  const url = new URL(req.url);
  const pathSecret = url.searchParams.get("secret");
  if (SECRET && SECRET.length > 0) {
    if (pathSecret !== SECRET) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
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
