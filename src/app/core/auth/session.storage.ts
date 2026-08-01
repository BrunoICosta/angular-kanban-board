import { User } from './auth.models';
import { isJwtExpired } from './jwt';

export interface Session {
  token: string;
  user: User;
}

const STORAGE_KEY = 'kanban.session';

/** Returns the persisted session, discarding it when malformed or expired. */
export function loadSession(now: number = Date.now()): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw) as Partial<Session>;
    if (typeof session.token !== 'string' || !session.user || isJwtExpired(session.token, now)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { token: session.token, user: session.user };
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // The session still lives in the store; it just won't survive a reload.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
