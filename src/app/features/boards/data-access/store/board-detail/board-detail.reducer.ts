import { createFeature, createReducer, on } from '@ngrx/store';

import { LoadStatus } from '../load-status.model';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';

/** UI state of the board page; columns and cards live in their own entity slices. */
export interface BoardDetailState {
  boardId: string | null;
  status: LoadStatus;
  error: string | null;
  /** Number of optimistic writes still waiting for the server (drives the "saving" badge). */
  pendingSaves: number;
}

export const initialBoardDetailState: BoardDetailState = {
  boardId: null,
  status: 'idle',
  error: null,
  pendingSaves: 0,
};

/** Optimistic writes started by the user... */
const writeStarted = [
  BoardPageActions.addColumn,
  BoardPageActions.updateColumn,
  BoardPageActions.deleteColumn,
  BoardPageActions.addCard,
  BoardPageActions.moveCard,
] as const;

/** ...and the API results that settle them (success or rollback). */
const writeSettled = [
  BoardApiActions.addColumnSuccess,
  BoardApiActions.addColumnFailure,
  BoardApiActions.updateColumnSuccess,
  BoardApiActions.updateColumnFailure,
  BoardApiActions.deleteColumnSuccess,
  BoardApiActions.deleteColumnFailure,
  BoardApiActions.addCardSuccess,
  BoardApiActions.addCardFailure,
  BoardApiActions.moveCardSuccess,
  BoardApiActions.moveCardFailure,
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
