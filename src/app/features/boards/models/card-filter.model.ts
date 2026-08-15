import { LabelId } from './card.model';

export interface CardFilter {
  /** Free text matched against title, description, assignee and checklist items. */
  query: string;
  /** A card matches when it has at least one of these labels. */
  labels: LabelId[];
}

export const EMPTY_FILTER: CardFilter = { query: '', labels: [] };
