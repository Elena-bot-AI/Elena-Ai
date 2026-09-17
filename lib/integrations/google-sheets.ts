export interface SurveySheetRow {
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
}

function constantTimeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

/**
 * Отправить строку в Google Sheets через Apps Script Web App (doPost).
 * Передача ТОЛЬКО POST body (чувствительные данные не светятся в URL-логах).
 * Подписываем запрос HMAC(SHA-256) через GOOGLE_SHEETS_SECRET — Web App должен проверять.
 */
export async function appendSurveyResponse(row: SurveySheetRow): Promise<{ ok: boolean; error?: string; raw?: any }> {
  const URL = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK || "";
  const SECRET = process.env.GOOGLE_SHEETS_SECRET || "";
  if (!URL) {
    return { ok: false, error: "GOOGLE_APPS_SCRIPT_WEBHOOK not set — skip save" };
  }
  try {
    const json = JSON.stringify(row);
    let signature = "";
    if (SECRET && SECRET.trim().length >= 16) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(json));
      signature = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    const body = "payload=" + encodeURIComponent(json);
    const res = await fetch(URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json, text/plain, */*",
        ...(signature ? { "X-Signature": "sha256=" + signature } : {}),
      },
      body,
    });
    const txt = await res.text();
    const lastRes = { http: res.status, body: txt, method: "POST-form" };
    if (res.status >= 200 && res.status < 300 && txt && !txt.startsWith("<!doctype") && !txt.startsWith("<!DOCTYPE")) {
      let data: any = { raw: txt };
      try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
      return { ok: data?.ok === true || !data?.error, raw: data };
    }
    return {
      ok: false,
      error:
        txt && (txt.startsWith("<!doctype") || txt.startsWith("<!DOCTYPE"))
          ? "Apps Script returned Google sign-in page — Web App permission must be set to 'Anyone' (Manage Deployments → Who has access)."
          : `HTTP ${lastRes.http} via ${lastRes.method}`,
      raw: lastRes,
    };
  } catch (e: any) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
}

export { constantTimeEq };
