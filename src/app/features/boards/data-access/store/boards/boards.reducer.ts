import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { Board } from '../../../models/board.model';
import { LoadStatus } from '../load-status.model';
import { BoardsApiActions, BoardsPageActions } from './boards.actions';

export interface BoardsState extends EntityState<Board> {
  status: LoadStatus;
  error: string | null;
}

export const boardsAdapter = createEntityAdapter<Board>({
  // Newest boards first.
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

export const initialBoardsState: BoardsState = boardsAdapter.getInitialState({
  status: 'idle',
  error: null,
});

export const boardsFeature = createFeature({
  name: 'boards',
  reducer: createReducer(
    initialBoardsState,
    on(BoardsPageActions.opened, (state): BoardsState => ({
      ...state,
      // Keep showing cached boards while refreshing in the background.
      status: state.status === 'loaded' ? 'loaded' : 'loading',
      error: null,
    })),
    on(BoardsApiActions.loadBoardsSuccess, (state, { boards }): BoardsState =>
      boardsAdapter.setAll(boards, { ...state, status: 'loaded', error: null }),
    ),
    on(BoardsApiActions.loadBoardsFailure, (state, { error }): BoardsState => ({
      ...state,
      status: 'error',
      error,
    })),

    // Optimistic writes: apply immediately, undo on failure.
    on(BoardsPageActions.createBoard, (state, { board }) => boardsAdapter.addOne(board, state)),
    on(BoardsApiActions.createBoardFailure, (state, { board }) =>
      boardsAdapter.removeOne(board.id, state),
    ),
    on(BoardsPageActions.updateBoard, (state, { board }) => boardsAdapter.upsertOne(board, state)),
    on(BoardsApiActions.updateBoardFailure, (state, { previous }) =>
      boardsAdapter.upsertOne(previous, state),
    ),
    on(BoardsPageActions.deleteBoard, (state, { board }) =>
      boardsAdapter.removeOne(board.id, state),
    ),
    on(BoardsApiActions.deleteBoardFailure, (state, { board }) =>
      boardsAdapter.addOne(board, state),
    ),
  ),
  extraSelectors: ({ selectBoardsState, selectStatus }) => {
    const { selectAll, selectEntities, selectTotal } =
      boardsAdapter.getSelectors(selectBoardsState);
    return {
      selectAllBoards: selectAll,
      selectBoardEntities: selectEntities,
      selectBoardsCount: selectTotal,
      selectBoardsLoading: createSelector(selectStatus, (status) => status === 'loading'),
    };
  },
});

export const {
  selectAllBoards,
  selectBoardEntities,
  selectBoardsCount,
  selectBoardsLoading,
  selectStatus: selectBoardsStatus,
  selectError: selectBoardsError,
} = boardsFeature;

export const selectBoardById = (id: string) =>
  createSelector(selectBoardEntities, (entities) => entities[id] ?? null);
