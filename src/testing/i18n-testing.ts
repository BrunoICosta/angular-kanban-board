import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';

import en from '../../public/i18n/en.json';
import ptBR from '../../public/i18n/pt-BR.json';
import { AppLang, LANG_TO_LOCALE, SUPPORTED_LANGS } from '../app/core/i18n/language';

/**
 * Real translation files, loaded synchronously, so specs assert on the text users actually see
 * (and fail when a key is missing).
 */
export function provideI18nTesting(lang: AppLang = 'pt-BR'): EnvironmentProviders[] {
  return [
    importProvidersFrom(
      TranslocoTestingModule.forRoot({
        langs: {
          'pt-BR': ptBR,
          en,
        },
        translocoConfig: {
          availableLangs: [...SUPPORTED_LANGS],
          defaultLang: lang,
          fallbackLang: 'pt-BR',
          reRenderOnLangChange: true,
        },
        preloadLangs: true,
      }),
    ),
    ...provideTranslocoLocale({ langToLocaleMapping: { ...LANG_TO_LOCALE } }),
  ];
}
