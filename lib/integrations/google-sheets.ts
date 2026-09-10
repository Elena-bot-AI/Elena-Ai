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

/**
 * Отправить строку в Google Sheets через Apps Script Web App (doPost).
 * URL: process.env.GOOGLE_APPS_SCRIPT_WEBHOOK → …/exec
 */
export async function appendSurveyResponse(row: SurveySheetRow): Promise<{ ok: boolean; error?: string; raw?: any }> {
  const URL = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK || "";
  if (!URL) {
    return { ok: false, error: "GOOGLE_APPS_SCRIPT_WEBHOOK not set — skip save" };
  }
  try {
    const json = JSON.stringify(row);
    const urlWithQuery = URL + (URL.includes("?") ? "&" : "?") + "payload=" + encodeURIComponent(json);

    let lastRes: any = null;
    let lastErr: string | null = null;

    // Strategy 1: GET with payload in query string (most reliable for Apps Script Web Apps)
    try {
      const res = await fetch(urlWithQuery, {
        method: "GET",
        redirect: "follow",
        headers: { Accept: "application/json, text/plain, */*" },
      });
      const txt = await res.text();
      lastRes = { http: res.status, body: txt, method: "GET" };
      if (res.status >= 200 && res.status < 300 && txt && !txt.startsWith("<!doctype") && !txt.startsWith("<!DOCTYPE")) {
        let data: any = { raw: txt };
        try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
        if (!data || data.ok === true) {
          return { ok: true, raw: data };
        }
      }
    } catch (e: any) {
      lastErr = e && e.message ? e.message : String(e);
    }

    // Strategy 2: POST form-urlencoded payload=<json> (fallback if GET fails)
    try {
      const body = "payload=" + encodeURIComponent(json);
      const res = await fetch(URL, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json, text/plain, */*",
        },
        body,
      });
      const txt = await res.text();
      lastRes = { http: res.status, body: txt, method: "POST-form" };
      if (res.status >= 200 && res.status < 300 && txt && !txt.startsWith("<!doctype") && !txt.startsWith("<!DOCTYPE")) {
        let data: any = { raw: txt };
        try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
        return { ok: data?.ok === true || !data?.error, raw: data };
      }
    } catch (e: any) {
      lastErr = e && e.message ? e.message : String(e);
    }

    return {
      ok: false,
      error:
        lastErr ||
        (lastRes && lastRes.body && lastRes.body.startsWith("<!doctype"))
          ? "Apps Script returned Google sign-in page — Web App permission must be set to 'Anyone, even anonymous' (Manage Deployments → Who has access)."
          : lastRes
            ? `HTTP ${lastRes.http} via ${lastRes.method}`
            : "Unknown error",
      raw: lastRes,
    };
  } catch (e: any) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
}
