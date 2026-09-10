export interface SurveySheetRow {
  chat_id: string | number;
  tg_username?: string;
  tg_first_name?: string;
  session_id: string;
  step_count: number;
  is_final: boolean;
  verdict_tag: string;
  answers: Record<string, any>;
  summary: string;
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
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    const txt = await res.text();
    let data: any = { raw: txt };
    try {
      data = JSON.parse(txt);
    } catch {
      data = { raw: txt };
    }
    if (data && data.ok === true) {
      return { ok: true, raw: data };
    }
    return { ok: false, error: (data && data.error) || `HTTP ${res.status}`, raw: data };
  } catch (e: any) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
}
