import { Card } from '../../models/card.model';
import { CardFilter } from '../../models/card-filter.model';

/** Lowercases and strips accents so "acao" matches "Ação". */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function isFilterActive(filter: CardFilter): boolean {
  return filter.query.trim().length > 0 || filter.labels.length > 0;
}

export function matchesFilter(card: Card, filter: CardFilter): boolean {
  if (filter.labels.length && !card.labels.some((label) => filter.labels.includes(label))) {
    return false;
  }
  const query = normalizeText(filter.query);
  if (!query) {
    return true;
  }
  const haystack = normalizeText(
    [card.title, card.description, card.assignee ?? '', ...card.checklist.map((i) => i.text)].join(
      ' ',
    ),
  );
  return query.split(/\s+/).every((term) => haystack.includes(term));
}
