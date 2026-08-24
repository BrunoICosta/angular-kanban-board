import {
  EnvironmentProviders,
  inject,
  isDevMode,
  provideAppInitializer,
  Provider,
} from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';

import { DEFAULT_LANG, LANG_TO_LOCALE, SUPPORTED_LANGS } from './language';
import { LanguageService } from './language.service';
import { TranslatedTitleStrategy } from './translated-title.strategy';
import { TranslocoHttpLoader } from './transloco-http.loader';

/**
 * Transloco setup: global strings in `public/i18n/<lang>.json`, feature strings in lazy scopes
 * registered by each feature route (`provideTranslocoScope('boards')`), Intl-based date/number
 * formatting that follows the active language, and translated route titles.
 */
export function provideI18n(): (EnvironmentProviders | Provider)[] {
  return [
    provideTransloco({
      config: {
        availableLangs: [...SUPPORTED_LANGS],
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        missingHandler: { useFallbackTranslation: true, logMissingKey: isDevMode() },
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoLocale({ langToLocaleMapping: { ...LANG_TO_LOCALE } }),
    { provide: TitleStrategy, useExisting: TranslatedTitleStrategy },
    // Load the initial language before the first render to avoid showing raw keys.
    provideAppInitializer(() => inject(LanguageService).init()),
  ];
}
