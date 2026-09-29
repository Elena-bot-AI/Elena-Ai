import { sheetRpc } from "./kv-store";

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

export interface ProgressSheetRow {
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
}

/**
 * Отправить финальный ответ пользователя в Google Sheets через Apps Script Web App (doPost).
 * Использует общий RPC (kv-store sheetRpc) — один канал для сессий и финальных ответов.
 */
export async function appendSurveyResponse(row: SurveySheetRow): Promise<{ ok: boolean; error?: string; raw?: any }> {
  const URL = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK || "";
  if (!URL) {
    return { ok: false, error: "GOOGLE_APPS_SCRIPT_WEBHOOK not set — skip save" };
  }
  try {
    const payload = { ...row, _action: "save_final" as const };
    const r = await sheetRpc(payload);
    return { ok: r.ok, error: r.error, raw: r };
  } catch (e: any) {
    return { ok: false, error: e?.message ? e.message : String(e) };
  }
}

/**
 * Обновить (или создать) строку прогресса пользователя в листе «Прогресс».
 * Один пользователь = одна строка (upsert по source + id).
 * Вызывается ПОСЛЕ каждого ответа.
 */
export async function upsertProgress(row: ProgressSheetRow): Promise<{ ok: boolean; error?: string; raw?: any }> {
  const URL = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK || "";
  if (!URL) {
    return { ok: false, error: "GOOGLE_APPS_SCRIPT_WEBHOOK not set — skip upsert progress" };
  }
  try {
    const payload = { ...row, _action: "progress_upsert" as const };
    const r = await sheetRpc(payload);
    return { ok: r.ok, error: r.error, raw: r };
  } catch (e: any) {
    return { ok: false, error: e?.message ? e.message : String(e) };
  }
}
