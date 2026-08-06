import { createFeature, createReducer, on } from '@ngrx/store';

import { LoadStatus } from '../load-status.model';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';

/** UI state of the board page; columns and cards live in their own entity slices. */
export interface BoardDetailState {
  boardId: string | null;
  status: LoadStatus;
  error: string | null;
}

export const initialBoardDetailState: BoardDetailState = {
  boardId: null,
  status: 'idle',
  error: null,
};

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
  ),
});
