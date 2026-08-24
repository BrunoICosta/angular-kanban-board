export const SUPPORTED_LANGS = ['pt-BR', 'en'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: AppLang = 'pt-BR';
export const LANG_STORAGE_KEY = 'kanban.lang';

/** Intl locale used for dates and numbers in each language. */
export const LANG_TO_LOCALE: Readonly<Record<AppLang, string>> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
};

export function isAppLang(value: unknown): value is AppLang {
  return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

/**
 * Picks the initial language: saved choice > browser languages (any `pt*` -> pt-BR, anything
 * else -> en) > pt-BR.
 */
export function detectLanguage(saved: string | null, browserLangs: readonly string[]): AppLang {
  if (isAppLang(saved)) {
    return saved;
  }
  const preferred = browserLangs.find(Boolean)?.toLowerCase();
  if (!preferred) {
    return DEFAULT_LANG;
  }
  return preferred.startsWith('pt') ? 'pt-BR' : 'en';
}

export function readSavedLanguage(): string | null {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLanguage(lang: AppLang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // The choice still applies to this session.
  }
}
