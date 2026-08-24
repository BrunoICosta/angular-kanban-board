import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

/**
 * Loads `public/i18n/<lang>.json` for global strings and `public/i18n/<scope>/<lang>.json` for
 * the lazy feature scopes (Transloco passes `auth/en`, `boards/pt-BR`, ...). The path is relative
 * so it also works under the GitHub Pages base href.
 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`i18n/${lang}.json`);
  }
}
