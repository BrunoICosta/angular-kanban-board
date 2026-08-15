import { createSelector } from '@ngrx/store';

import { Card } from '../../../models/card.model';
import { isFilterActive, matchesFilter } from '../../utils/card-filter';
import { selectBoardEntities } from '../boards/boards.reducer';
import { boardDetailFeature } from './board-detail.reducer';
import { cardsFeature } from './cards.reducer';
import { columnsFeature } from './columns.reducer';

export const {
  selectBoardId: selectCurrentBoardId,
  selectStatus: selectBoardStatus,
  selectError: selectBoardError,
  selectPendingSaves,
  selectFilter,
} = boardDetailFeature;

export const selectIsFiltering = createSelector(selectFilter, isFilterActive);

export const selectCurrentBoard = createSelector(
  selectBoardEntities,
  selectCurrentBoardId,
  (boards, boardId) => (boardId ? (boards[boardId] ?? null) : null),
);

/** Columns of the open board, ordered by position. */
export const selectBoardColumns = createSelector(
  columnsFeature.selectAllColumns,
  selectCurrentBoardId,
  (columns, boardId) => columns.filter((column) => column.boardId === boardId),
);

export type CardsByColumn = Readonly<Record<string, Card[] | undefined>>;

/** Every card of the open board grouped by column id (each list ordered by position). */
export const selectCardsByColumn = createSelector(
  selectBoardColumns,
  cardsFeature.selectAllCards,
  (columns, cards): CardsByColumn => {
    const grouped: Record<string, Card[] | undefined> = Object.fromEntries(
      columns.map((column) => [column.id, [] as Card[]]),
    );
    for (const card of cards) {
      grouped[card.columnId]?.push(card);
    }
    return grouped;
  },
);

/** Same shape as `selectCardsByColumn`, keeping only cards that match the active filter. */
export const selectVisibleCardsByColumn = createSelector(
  selectCardsByColumn,
  selectFilter,
  (cardsByColumn, filter): CardsByColumn => {
    if (!isFilterActive(filter)) {
      return cardsByColumn;
    }
    return Object.fromEntries(
      Object.entries(cardsByColumn).map(([columnId, cards]) => [
        columnId,
        cards?.filter((card) => matchesFilter(card, filter)),
      ]),
    );
  },
);

export const selectFilterSummary = createSelector(
  selectCardsByColumn,
  selectVisibleCardsByColumn,
  (all, visible) => {
    const count = (byColumn: CardsByColumn) =>
      Object.values(byColumn).reduce((total, cards) => total + (cards?.length ?? 0), 0);
    return { total: count(all), visible: count(visible) };
  },
);
