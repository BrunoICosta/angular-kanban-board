export type LabelId = 'feature' | 'bug' | 'urgent' | 'design' | 'backend' | 'frontend' | 'docs';

/** Display names live in the i18n files (`boards.labels.<id>`). */
export interface Label {
  id: LabelId;
  color: string;
}

export const LABELS: readonly Label[] = [
  { id: 'feature', color: '#8b6dff' },
  { id: 'bug', color: '#ff5c7a' },
  { id: 'urgent', color: '#f5a524' },
  { id: 'design', color: '#e05cff' },
  { id: 'backend', color: '#3ba5ff' },
  { id: 'frontend', color: '#2fc98a' },
  { id: 'docs', color: '#94a0b8' },
];

export const LABELS_BY_ID: Readonly<Record<LabelId, Label>> = Object.fromEntries(
  LABELS.map((label) => [label.id, label]),
) as Record<LabelId, Label>;

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  /** Zero-based order of the card inside its column. */
  position: number;
  title: string;
  description: string;
  labels: LabelId[];
  /** Calendar date in `yyyy-MM-dd` format. */
  dueDate: string | null;
  checklist: ChecklistItem[];
  /** Display name of the person responsible for the card. */
  assignee: string | null;
  createdAt: string;
}
