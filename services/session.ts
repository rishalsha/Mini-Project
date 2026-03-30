import { User } from "../types";

const SESSION_KEY = "autofolio.session.v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface StoredSession {
  user: User;
  issuedAt: number;
  expiresAt: number;
}

export function saveSession(user: User): void {
  try {
    const now = Date.now();
    const payload: StoredSession = {
      user,
      issuedAt: now,
      expiresAt: now + SESSION_TTL_MS,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures (private mode/full storage)
  }
}

export function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.user || !parsed?.expiresAt) {
      clearSession();
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      clearSession();
      return null;
    }

    return parsed.user;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures
  }
}
