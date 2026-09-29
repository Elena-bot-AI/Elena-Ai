import type { SessionState } from "@/types/bot";
import { createInitialState } from "@/lib/engine/engine";
import { kvGet, kvSet, kvDel } from "@/lib/integrations/kv-store";

const TTL_MS = 1000 * 60 * 60 * 4;
const TTL_SEC = Math.round(TTL_MS / 1000);

const MEM_TTL_MAP = new Map<string, { ttlMs: number; touchedAt: number }>();
const SESSION_PREFIX = "session:";

function keyFor(id: string) {
  return SESSION_PREFIX + String(id);
}

export async function getSession(id: string): Promise<SessionState> {
  const k = keyFor(id);
  const existing = (await kvGet<SessionState>(k)) as SessionState | null;
  if (existing && typeof existing === "object" && existing.sessionId) {
    await kvSet(k, existing, TTL_SEC);
    return existing;
  }
  const fresh = createInitialState(id);
  await kvSet(k, fresh, TTL_SEC);
  MEM_TTL_MAP.set(k, { ttlMs: TTL_MS, touchedAt: Date.now() });
  return fresh;
}

export async function setSession(id: string, state: SessionState): Promise<void> {
  await kvSet(keyFor(id), state, TTL_SEC);
}

export async function deleteSession(id: string): Promise<void> {
  await kvDel(keyFor(id));
}
