import type { SessionState } from "@/types/bot";
import { createInitialState } from "@/lib/engine/engine";

const TTL_MS = 1000 * 60 * 60 * 4;

interface Entry {
  state: SessionState;
  touchedAt: number;
}

const map = new Map<string, Entry>();

function sweep() {
  const now = Date.now();
  for (const [k, v] of Array.from(map.entries())) {
    if (now - v.touchedAt > TTL_MS) map.delete(k);
  }
  if (map.size > 5000) {
    const keys = Array.from(map.keys()).slice(0, 500);
    keys.forEach((k) => map.delete(k));
  }
}

export function getSession(id: string): SessionState {
  sweep();
  const existing = map.get(id);
  if (existing) {
    existing.touchedAt = Date.now();
    return existing.state;
  }
  const fresh = createInitialState(id);
  map.set(id, { state: fresh, touchedAt: Date.now() });
  return fresh;
}

export function setSession(id: string, state: SessionState) {
  map.set(id, { state, touchedAt: Date.now() });
}

export function deleteSession(id: string) {
  map.delete(id);
}
