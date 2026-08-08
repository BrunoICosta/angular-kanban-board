import { Card } from '../../models/card.model';
import { Column } from '../../models/column.model';

/**
 * Result of a drag & drop: the entities whose position (or column) changed, with their new
 * values (`moved`) and their values before the move (`previous`, used for rollbacks).
 */
export interface Reorder<T> {
  moved: T[];
  previous: T[];
}

interface Positioned {
  id: string;
  position: number;
}

/** Immutable version of CDK's `moveItemInArray`, with indexes clamped to the list bounds. */
export function moveItem<T>(list: readonly T[], fromIndex: number, toIndex: number): T[] {
  const result = [...list];
  const from = clamp(fromIndex, 0, result.length - 1);
  const to = clamp(toIndex, 0, result.length - 1);
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function changedOnly<T extends Positioned>(
  original: ReadonlyMap<string, T>,
  next: T[],
  hasChanged: (before: T, after: T) => boolean,
): Reorder<T> {
  const moved = next.filter((item) => {
    const before = original.get(item.id);
    return !before || hasChanged(before, item);
  });
  return {
    moved,
    previous: moved.map((item) => original.get(item.id)).filter((item) => item !== undefined),
  };
}

/** Moves a column to `toIndex` and renumbers positions as 0..n-1. */
export function reorderColumns(
  columns: readonly Column[],
  fromIndex: number,
  toIndex: number,
): Reorder<Column> {
  const original = new Map(columns.map((column) => [column.id, column]));
  const next = moveItem(columns, fromIndex, toIndex).map((column, position) => ({
    ...column,
    position,
  }));
  return changedOnly(original, next, (before, after) => before.position !== after.position);
}

/**
 * Moves a card to `toIndex` inside `toColumnId` (which may be its current column) and
 * renumbers the source and target columns. Only cards that actually changed are returned,
 * so a drop at the same place produces an empty result.
 */
export function moveCard(
  cardsByColumn: Readonly<Record<string, readonly Card[] | undefined>>,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): Reorder<Card> {
  const allCards = Object.values(cardsByColumn).flatMap((cards) => cards ?? []);
  const card = allCards.find((item) => item.id === cardId);
  const targetCards = cardsByColumn[toColumnId];
  if (!card || !targetCards) {
    return { moved: [], previous: [] };
  }

  const sourceWithout = (cardsByColumn[card.columnId] ?? []).filter((item) => item.id !== cardId);
  const targetWithout =
    card.columnId === toColumnId ? sourceWithout : targetCards.filter((item) => item.id !== cardId);
  const insertAt = clamp(toIndex, 0, targetWithout.length);
  const target = [
    ...targetWithout.slice(0, insertAt),
    { ...card, columnId: toColumnId },
    ...targetWithout.slice(insertAt),
  ];

  const renumber = (cards: Card[]) => cards.map((item, position) => ({ ...item, position }));
  const next =
    card.columnId === toColumnId
      ? renumber(target)
      : [...renumber(sourceWithout), ...renumber(target)];

  const original = new Map(allCards.map((item) => [item.id, item]));
  return changedOnly(
    original,
    next,
    (before, after) => before.position !== after.position || before.columnId !== after.columnId,
  );
}
