import authEn from '../../../../public/i18n/auth/en.json';
import authPtBR from '../../../../public/i18n/auth/pt-BR.json';
import boardsEn from '../../../../public/i18n/boards/en.json';
import boardsPtBR from '../../../../public/i18n/boards/pt-BR.json';
import en from '../../../../public/i18n/en.json';
import ptBR from '../../../../public/i18n/pt-BR.json';
import { createSeedDb } from '../../mock-api/seed-data';
import { detectLanguage } from './language';

/** Flattens `{ a: { b: 'x' } }` into `['a.b']`. */
function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === 'object'
      ? keys(child as object, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('detectLanguage', () => {
  it('prefers a valid saved choice', () => {
    expect(detectLanguage('en', ['pt-BR'])).toBe('en');
    expect(detectLanguage('pt-BR', ['en-US'])).toBe('pt-BR');
  });

  it('ignores unsupported saved values', () => {
    expect(detectLanguage('fr', ['en-GB'])).toBe('en');
  });

  it('maps any Portuguese browser language to pt-BR and anything else to English', () => {
    expect(detectLanguage(null, ['pt-PT', 'en'])).toBe('pt-BR');
    expect(detectLanguage(null, ['PT'])).toBe('pt-BR');
    expect(detectLanguage(null, ['de-DE', 'pt-BR'])).toBe('en');
  });

  it('falls back to pt-BR when the browser gives nothing', () => {
    expect(detectLanguage(null, [])).toBe('pt-BR');
    expect(detectLanguage(null, [''])).toBe('pt-BR');
  });
});

describe('translation files', () => {
  const pairs: [string, object, object][] = [
    ['global', ptBR, en],
    ['auth', authPtBR, authEn],
    ['boards', boardsPtBR, boardsEn],
  ];

  for (const [name, pt, english] of pairs) {
    it(`has the same keys in pt-BR and en (${name})`, () => {
      expect(keys(english).sort()).toEqual(keys(pt).sort());
    });
  }
});

describe('sample data', () => {
  it('is seeded in the active language', () => {
    expect(createSeedDb('pt-BR').boards.map((b) => b.title)).toContain('Lançamento do app');
    expect(createSeedDb('en').boards.map((b) => b.title)).toContain('App launch');
    expect(createSeedDb('en').columns.map((c) => c.title)).toContain('In progress');
  });
});
