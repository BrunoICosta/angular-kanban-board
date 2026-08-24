import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { isAppLang, SUPPORTED_LANGS } from './language';
import { LanguageService } from './language.service';

let nextId = 0;

/** Native `<select>`: accessible by default (label, keyboard, screen readers, mobile pickers). */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe],
  template: `
    <label class="sr-only" [for]="selectId">{{ 'language.label' | transloco }}</label>
    <span class="switcher__code" aria-hidden="true">{{
      language.lang() === 'en' ? 'EN' : 'PT'
    }}</span>
    <select
      class="switcher__select"
      [id]="selectId"
      [value]="language.lang()"
      (change)="onChange($event)"
    >
      @for (lang of langs; track lang) {
        <option [value]="lang" [selected]="lang === language.lang()">
          {{ 'language.names.' + lang | transloco }}
        </option>
      }
    </select>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      height: 34px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      transition:
        background var(--transition),
        color var(--transition);

      &:hover {
        background: var(--surface-hover);
        color: var(--text);
      }

      &:focus-within {
        box-shadow: var(--focus-ring);
      }
    }

    .switcher__code {
      padding: 0 0.55rem;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    /* The select covers the visible code so the whole area opens the native picker. */
    .switcher__select {
      position: absolute;
      inset: 0;
      width: 100%;
      opacity: 0;
      cursor: pointer;

      &:focus {
        outline: none;
      }

      option {
        color: initial;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly language = inject(LanguageService);
  protected readonly langs = SUPPORTED_LANGS;
  protected readonly selectId = `language-switcher-${nextId++}`;

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isAppLang(value)) {
      this.language.setLang(value);
    }
  }
}
