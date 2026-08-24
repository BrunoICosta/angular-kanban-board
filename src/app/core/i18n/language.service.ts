import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { AppLang, DEFAULT_LANG, detectLanguage, readSavedLanguage, saveLanguage } from './language';

/** Single place that changes the UI language (Transloco, `<html lang>` and persistence). */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly _lang = signal<AppLang>(DEFAULT_LANG);

  readonly lang = this._lang.asReadonly();

  /** Activates the detected language and resolves once its translations are loaded. */
  init(): Observable<unknown> {
    const navigator = this.document.defaultView?.navigator;
    const browserLangs = navigator?.languages?.length
      ? navigator.languages
      : [navigator?.language ?? ''];
    const lang = detectLanguage(readSavedLanguage(), browserLangs);
    this.apply(lang);
    return this.transloco.load(lang);
  }

  setLang(lang: AppLang): void {
    if (lang === this._lang()) {
      return;
    }
    saveLanguage(lang);
    this.apply(lang);
  }

  private apply(lang: AppLang): void {
    this._lang.set(lang);
    this.transloco.setActiveLang(lang);
    this.document.documentElement.lang = lang;
  }
}
