import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { provideI18nTesting } from '../../../testing/i18n-testing';
import { LANG_STORAGE_KEY } from './language';
import { LanguageService } from './language.service';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    localStorage.removeItem(LANG_STORAGE_KEY);
    TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [provideI18nTesting()],
    });
    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(LANG_STORAGE_KEY);
    document.documentElement.lang = 'pt-BR';
  });

  const group = () => element.querySelector('[role="radiogroup"]');
  /** Finds a radio by its accessible name (aria-label). */
  function radio(name: string): HTMLButtonElement {
    const found = [...element.querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(
      (el) => el.getAttribute('aria-label') === name,
    );
    if (!found) {
      throw new Error(`radio "${name}" not found`);
    }
    return found;
  }

  it('renders a labelled radio group with one flag per language, named in its own language', () => {
    expect(group()?.getAttribute('aria-label')).toBe('Idioma');

    const portuguese = radio('Português (Brasil)');
    const english = radio('English');
    expect(portuguese.getAttribute('lang')).toBe('pt-BR');
    expect(english.getAttribute('lang')).toBe('en');
    expect(english.title).toBe('English');
    expect(english.querySelector('app-flag')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('marks the active language as checked and keeps only it in the tab order', () => {
    expect(radio('Português (Brasil)').getAttribute('aria-checked')).toBe('true');
    expect(radio('Português (Brasil)').tabIndex).toBe(0);
    expect(radio('English').getAttribute('aria-checked')).toBe('false');
    expect(radio('English').tabIndex).toBe(-1);
  });

  it('switches on click, persists the choice and updates <html lang>', () => {
    radio('English').click();
    fixture.detectChanges();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(radio('English').getAttribute('aria-checked')).toBe('true');
    expect(group()?.getAttribute('aria-label')).toBe('Language');
  });

  it('moves the selection with the arrow keys', () => {
    radio('Português (Brasil)').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    fixture.detectChanges();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(document.activeElement).toBe(radio('English'));

    radio('English').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    fixture.detectChanges();
    expect(TestBed.inject(LanguageService).lang()).toBe('pt-BR');
  });
});

describe('LanguageService.init', () => {
  afterEach(() => localStorage.removeItem(LANG_STORAGE_KEY));

  it('restores the saved language on startup', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'en');
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });

    TestBed.inject(LanguageService).init().subscribe();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    document.documentElement.lang = 'pt-BR';
  });
});
