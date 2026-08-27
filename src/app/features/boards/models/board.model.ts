export type BoardColorId =
  'violet' | 'blue' | 'cyan' | 'green' | 'amber' | 'orange' | 'pink' | 'slate';

/** Display names live in the i18n files (`boards.colors.<id>`). */
export interface BoardColor {
  id: BoardColorId;
  value: string;
}

export const BOARD_COLORS: readonly BoardColor[] = [
  { id: 'violet', value: '#7c5cff' },
  { id: 'blue', value: '#3b82f6' },
  { id: 'cyan', value: '#06b6d4' },
  { id: 'green', value: '#22c55e' },
  { id: 'amber', value: '#f59e0b' },
  { id: 'orange', value: '#f97316' },
  { id: 'pink', value: '#ec4899' },
  { id: 'slate', value: '#64748b' },
];

export function boardColorValue(id: BoardColorId): string {
  return BOARD_COLORS.find((color) => color.id === id)?.value ?? BOARD_COLORS[0].value;
}

export interface Board {
  id: string;
  title: string;
  color: BoardColorId;
  createdAt: string;
}
