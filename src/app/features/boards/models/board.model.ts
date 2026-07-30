export type BoardColorId =
  'violet' | 'blue' | 'cyan' | 'green' | 'amber' | 'orange' | 'pink' | 'slate';

export interface BoardColor {
  id: BoardColorId;
  name: string;
  value: string;
}

export const BOARD_COLORS: readonly BoardColor[] = [
  { id: 'violet', name: 'Violeta', value: '#7c5cff' },
  { id: 'blue', name: 'Azul', value: '#3b82f6' },
  { id: 'cyan', name: 'Ciano', value: '#06b6d4' },
  { id: 'green', name: 'Verde', value: '#22c55e' },
  { id: 'amber', name: 'Âmbar', value: '#f59e0b' },
  { id: 'orange', name: 'Laranja', value: '#f97316' },
  { id: 'pink', name: 'Rosa', value: '#ec4899' },
  { id: 'slate', name: 'Grafite', value: '#64748b' },
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
