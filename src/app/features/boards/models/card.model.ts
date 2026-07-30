export type LabelId = 'feature' | 'bug' | 'urgent' | 'design' | 'backend' | 'frontend' | 'docs';

export interface Label {
  id: LabelId;
  name: string;
  color: string;
}

export const LABELS: readonly Label[] = [
  { id: 'feature', name: 'Feature', color: '#8b6dff' },
  { id: 'bug', name: 'Bug', color: '#ff5c7a' },
  { id: 'urgent', name: 'Urgente', color: '#f5a524' },
  { id: 'design', name: 'Design', color: '#e05cff' },
  { id: 'backend', name: 'Backend', color: '#3ba5ff' },
  { id: 'frontend', name: 'Frontend', color: '#2fc98a' },
  { id: 'docs', name: 'Docs', color: '#94a0b8' },
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
