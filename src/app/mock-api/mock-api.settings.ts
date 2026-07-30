/** Browser-persisted switches that change how the fake backend behaves. */
export const MOCK_DB_STORAGE_KEY = 'kanban.db.v1';
const FAILURES_STORAGE_KEY = 'kanban.simulateFailures';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore: storage may be unavailable (private mode, quota).
  }
}

export const mockApiSettings = {
  /** When enabled every write request fails with 503, which is handy to see rollbacks. */
  get simulateFailures(): boolean {
    return read(FAILURES_STORAGE_KEY) === 'true';
  },
  set simulateFailures(enabled: boolean) {
    write(FAILURES_STORAGE_KEY, enabled ? 'true' : null);
  },
  readDb(): string | null {
    return read(MOCK_DB_STORAGE_KEY);
  },
  writeDb(serialized: string): void {
    write(MOCK_DB_STORAGE_KEY, serialized);
  },
  clearDb(): void {
    write(MOCK_DB_STORAGE_KEY, null);
  },
};
