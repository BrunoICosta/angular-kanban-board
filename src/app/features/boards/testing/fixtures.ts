import { Board } from '../models/board.model';
import { Card } from '../models/card.model';
import { Column } from '../models/column.model';

/** Small factories for specs: sensible defaults, override only what the test cares about. */
export function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 'b1',
    title: 'Sprint',
    color: 'violet',
    createdAt: '2026-08-01T12:00:00.000Z',
    ...overrides,
  };
}

export function makeColumn(overrides: Partial<Column> = {}): Column {
  return {
    id: 'c1',
    boardId: 'b1',
    title: 'A fazer',
    position: 0,
    wipLimit: null,
    ...overrides,
  };
}

export function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'k1',
    boardId: 'b1',
    columnId: 'c1',
    position: 0,
    title: 'Card',
    description: '',
    labels: [],
    dueDate: null,
    checklist: [],
    assignee: null,
    createdAt: '2026-08-01T12:00:00.000Z',
    ...overrides,
  };
}
