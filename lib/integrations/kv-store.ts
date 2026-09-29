function constantTimeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

interface SheetSaveFinalRow {
  _action?: "save_final";
  chat_id: string | number;
  tg_username?: string;
  tg_first_name?: string;
  session_id: string;
  step_count: number;
  is_final: boolean;
  verdict_tag?: string;
  answers?: Record<string, any>;
  flat_answers_24: Record<string, string>;
  summary_engine: string;
  llm_paraphrase?: string;
  [k: string]: any;
}
interface KvGetCmd { _action: "kv_get"; _key: string; }
interface KvSetCmd { _action: "kv_set"; _key: string; _value: any; _ttl_sec?: number; }
interface KvDelCmd { _action: "kv_del"; _key: string; }
interface ProgressUpsertCmd {
  _action: "progress_upsert";
  source: "telegram" | "salebot";
  id: string | number;
  tg_username?: string;
  tg_first_name?: string;
  session_id: string;
  step_count: number;
  current_step_id: string;
  is_final: boolean;
  answers_flat: Record<string, string>;
  verdict_tag?: string;
  summary_engine?: string;
  [k: string]: any;
}
type SheetCmd = SheetSaveFinalRow | KvGetCmd | KvSetCmd | KvDelCmd | ProgressUpsertCmd;

const SHEET_SESSIONS_NAME = "Sessions";
const SHEET_DATA_NAME = "Ответы";
const KV_PREFIX = "elena-ai:";

function hmacSha256Hex(keyStr: string, msgStr: string): string {
  let sig: Uint8Array;
  const keyBuffer = new TextEncoder().encode(keyStr);
  const msgBuffer = new TextEncoder().encode(msgStr);
  try {
    const k = require("crypto").createHmac("sha256", keyBuffer);
    k.update(msgBuffer);
    sig = Uint8Array.from(k.digest());
  } catch {
    sig = new Uint8Array(32);
  }
  return Array.from(sig).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sheetRpc(
  cmd: SheetCmd,
): Promise<{ ok: boolean; error?: string; value?: any }> {
  const URL = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK || "";
  const SECRET = process.env.GOOGLE_SHEETS_SECRET || "";
  if (!URL) {
    return { ok: false, error: "GOOGLE_APPS_SCRIPT_WEBHOOK not set" };
  }
  try {
    const json = JSON.stringify(cmd);
    let signature = "";
    if (SECRET && SECRET.trim().length >= 16) {
      signature = "sha256=" + hmacSha256Hex(SECRET.trim(), json);
    }
    const body = "payload=" + encodeURIComponent(json);
    const res = await fetch(URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json, text/plain, */*",
        ...(signature ? { "X-Signature": signature } : {}),
      },
      body,
    });
    const txt = await res.text();
    if (res.status >= 200 && res.status < 300 && txt && !txt.startsWith("<!doctype") && !txt.startsWith("<!DOCTYPE")) {
      let data: any = { raw: txt };
      try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
      return { ok: data?.ok === true, error: data?.error, value: data?.value };
    }
    return {
      ok: false,
      error:
        txt && (txt.startsWith("<!doctype") || txt.startsWith("<!DOCTYPE"))
          ? "Apps Script returned sign-in page (deploy access must be 'Anyone')"
          : `HTTP ${res.status} sheetRpc`,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

const MEM_TTL_MAP = new Map<string, { value: any; expireAt?: number }>();
function memSweep() {
  const now = Date.now();
  for (const [k, v] of Array.from(MEM_TTL_MAP.entries())) {
    if (v.expireAt && now > v.expireAt) MEM_TTL_MAP.delete(k);
  }
  if (MEM_TTL_MAP.size > 10000) {
    const keys = Array.from(MEM_TTL_MAP.keys()).slice(0, 1000);
    keys.forEach((k) => MEM_TTL_MAP.delete(k));
  }
}
setInterval(memSweep, 60_000).unref?.();

function hasSheetRpc(): boolean {
  return !!(process.env.GOOGLE_APPS_SCRIPT_WEBHOOK && process.env.GOOGLE_SHEETS_SECRET && process.env.GOOGLE_SHEETS_SECRET.trim().length >= 16);
}

export async function kvGet<T = any>(key: string): Promise<T | null> {
  const k = KV_PREFIX + key;
  if (hasSheetRpc()) {
    const r = await sheetRpc({ _action: "kv_get", _key: k });
    if (r.ok && r.value !== undefined && r.value !== null) return r.value as T;
    if (r.ok) return null;
    // sheetRpc failed → fall through memory
  }
  memSweep();
  const e = MEM_TTL_MAP.get(k);
  if (!e) return null;
  if (e.expireAt && Date.now() > e.expireAt) {
    MEM_TTL_MAP.delete(k);
    return null;
  }
  return e.value as T;
}

export async function kvSet(
  key: string,
  value: any,
  ttlSec?: number,
): Promise<void> {
  const k = KV_PREFIX + key;
  MEM_TTL_MAP.set(k, {
    value,
    expireAt: ttlSec && ttlSec > 0 ? Date.now() + ttlSec * 1000 : undefined,
  });
  if (hasSheetRpc()) {
    const cmd: KvSetCmd = { _action: "kv_set", _key: k, _value: value };
    if (ttlSec && ttlSec > 0) cmd._ttl_sec = ttlSec;
    const r = await sheetRpc(cmd);
    if (!r.ok) console.warn("kv_set sheetRpc failed:", r.error, "key=", k);
  }
}

export async function kvDel(key: string): Promise<void> {
  const k = KV_PREFIX + key;
  MEM_TTL_MAP.delete(k);
  if (hasSheetRpc()) {
    const r = await sheetRpc({ _action: "kv_del", _key: k });
    if (!r.ok) console.warn("kv_del sheetRpc failed:", r.error, "key=", k);
  }
}

export function kvHasRedis(): boolean {
  return hasSheetRpc();
}

export { constantTimeEq };
