import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { FlagComponent } from '../../shared/ui/flag/flag.component';
import { AppLang, LANG_FLAGS, LANG_NATIVE_NAMES, SUPPORTED_LANGS } from './language';
import { LanguageService } from './language.service';

/**
 * Flag buttons acting as a radio group (WAI-ARIA radio pattern): Tab reaches the checked flag,
 * arrow keys move and select. Each option is named in its own language ("English", not "Inglês").
 */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe, FlagComponent],
  template: `
    <div class="switcher" role="radiogroup" [attr.aria-label]="'language.label' | transloco">
      @for (lang of langs; track lang) {
        <button
          type="button"
          class="switcher__option"
          role="radio"
          [attr.lang]="lang"
          [attr.aria-checked]="lang === language.lang()"
          [attr.aria-label]="names[lang]"
          [attr.title]="names[lang]"
          [tabIndex]="lang === language.lang() ? 0 : -1"
          (click)="select(lang)"
          (keydown)="onKeydown($event)"
        >
          <app-flag [code]="flags[lang]" />
        </button>
      }
    </div>
  `,
  styles: `
    .switcher {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px;
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      background: var(--bg-elevated);
    }

    .switcher__option {
      display: inline-grid;
      place-items: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      cursor: pointer;
      transition: background var(--transition);

      app-flag {
        opacity: 0.55;
        filter: grayscale(0.7);
        transition:
          opacity var(--transition),
          filter var(--transition),
          transform var(--transition);
      }

      &:hover,
      &:focus-visible {
        background: var(--surface-hover);

        app-flag {
          opacity: 1;
          filter: none;
        }
      }

      /* Selected: full color plus a ring, so the state is not conveyed by color alone. */
      &[aria-checked='true'] {
        background: var(--accent-soft);

        app-flag {
          opacity: 1;
          filter: none;
          box-shadow:
            0 0 0 2px var(--bg-elevated),
            0 0 0 4px var(--accent);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly language = inject(LanguageService);
  protected readonly langs = SUPPORTED_LANGS;
  protected readonly names = LANG_NATIVE_NAMES;
  protected readonly flags = LANG_FLAGS;

  protected select(lang: AppLang): void {
    this.language.setLang(lang);
  }

  /** Arrow keys move the selection (and focus) to the previous/next language, wrapping around. */
  protected onKeydown(event: KeyboardEvent): void {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) {
      return;
    }
    event.preventDefault();
    const index = SUPPORTED_LANGS.indexOf(this.language.lang());
    const next = (index + step + SUPPORTED_LANGS.length) % SUPPORTED_LANGS.length;
    this.select(SUPPORTED_LANGS[next]);
    this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }
}
