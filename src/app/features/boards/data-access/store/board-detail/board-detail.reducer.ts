import { createFeature, createReducer, on } from '@ngrx/store';

import { CardFilter, EMPTY_FILTER } from '../../../models/card-filter.model';
import { LoadStatus } from '../load-status.model';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';

/** UI state of the board page; columns and cards live in their own entity slices. */
export interface BoardDetailState {
  boardId: string | null;
  status: LoadStatus;
  error: string | null;
  /** Number of optimistic writes still waiting for the server (drives the "saving" badge). */
  pendingSaves: number;
  filter: CardFilter;
}

export const initialBoardDetailState: BoardDetailState = {
  boardId: null,
  status: 'idle',
  error: null,
  pendingSaves: 0,
  filter: EMPTY_FILTER,
};

/** Optimistic writes started by the user... */
const writeStarted = [
  BoardPageActions.addColumn,
  BoardPageActions.updateColumn,
  BoardPageActions.deleteColumn,
  BoardPageActions.moveColumn,
  BoardPageActions.addCard,
  BoardPageActions.moveCard,
  BoardPageActions.updateCard,
  BoardPageActions.deleteCard,
] as const;

/** ...and the API results that settle them (success or rollback). */
const writeSettled = [
  BoardApiActions.addColumnSuccess,
  BoardApiActions.addColumnFailure,
  BoardApiActions.updateColumnSuccess,
  BoardApiActions.updateColumnFailure,
  BoardApiActions.deleteColumnSuccess,
  BoardApiActions.deleteColumnFailure,
  BoardApiActions.moveColumnSuccess,
  BoardApiActions.moveColumnFailure,
  BoardApiActions.addCardSuccess,
  BoardApiActions.addCardFailure,
  BoardApiActions.moveCardSuccess,
  BoardApiActions.moveCardFailure,
  BoardApiActions.updateCardSuccess,
  BoardApiActions.updateCardFailure,
  BoardApiActions.deleteCardSuccess,
  BoardApiActions.deleteCardFailure,
] as const;

export const boardDetailFeature = createFeature({
  name: 'boardDetail',
  reducer: createReducer(
    initialBoardDetailState,
    on(BoardPageActions.opened, (state, { boardId }): BoardDetailState => ({
      ...state,
      boardId,
      status: 'loading',
      error: null,
      // Filters belong to a board visit; opening another board starts clean.
      filter: state.boardId === boardId ? state.filter : EMPTY_FILTER,
    })),
    on(BoardPageActions.searchChanged, (state, { query }): BoardDetailState => ({
      ...state,
      filter: { ...state.filter, query },
    })),
    on(BoardPageActions.labelFilterToggled, (state, { label }): BoardDetailState => {
      const labels = state.filter.labels.includes(label)
        ? state.filter.labels.filter((id) => id !== label)
        : [...state.filter.labels, label];
      return { ...state, filter: { ...state.filter, labels } };
    }),
    on(BoardPageActions.filtersCleared, (state): BoardDetailState => ({
      ...state,
      filter: EMPTY_FILTER,
    })),
    on(BoardApiActions.loadBoardSuccess, (state): BoardDetailState => ({
      ...state,
      status: 'loaded',
    })),
    on(BoardApiActions.loadBoardFailure, (state, { error }): BoardDetailState => ({
      ...state,
      status: 'error',
      error,
    })),
    on(...writeStarted, (state): BoardDetailState => ({
      ...state,
      pendingSaves: state.pendingSaves + 1,
    })),
    on(...writeSettled, (state): BoardDetailState => ({
      ...state,
      pendingSaves: Math.max(0, state.pendingSaves - 1),
    })),
  ),
});
