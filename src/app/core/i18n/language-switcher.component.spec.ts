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

  function select(): HTMLSelectElement {
    const el = element.querySelector('select');
    if (!el) {
      throw new Error('select not found');
    }
    return el;
  }

  it('is labelled and lists both languages', () => {
    const label = element.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Idioma');
    expect(label?.getAttribute('for')).toBe(select().id);
    expect([...select().options].map((o) => o.textContent?.trim())).toEqual([
      'Português (Brasil)',
      'English',
    ]);
    expect(element.querySelector('.switcher__code')?.textContent?.trim()).toBe('PT');
  });

  it('switches the language, persists it and updates <html lang>', () => {
    select().value = 'en';
    select().dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(element.querySelector('label')?.textContent?.trim()).toBe('Language');
    expect(element.querySelector('.switcher__code')?.textContent?.trim()).toBe('EN');
  });

  it('ignores values that are not supported languages', () => {
    select().value = 'fr';
    select().dispatchEvent(new Event('change'));

    expect(TestBed.inject(LanguageService).lang()).toBe('pt-BR');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBeNull();
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
