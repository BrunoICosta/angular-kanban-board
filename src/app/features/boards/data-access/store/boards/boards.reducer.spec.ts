import { makeBoard } from '../../../testing/fixtures';
import { BoardApiActions } from '../board-detail/board-detail.actions';
import { BoardsApiActions, BoardsPageActions } from './boards.actions';
import { boardsFeature, initialBoardsState } from './boards.reducer';

const { reducer } = boardsFeature;

describe('boards reducer', () => {
  const older = makeBoard({ id: 'old', createdAt: '2026-07-01T00:00:00.000Z' });
  const newer = makeBoard({ id: 'new', createdAt: '2026-08-01T00:00:00.000Z' });
  const loaded = reducer(
    initialBoardsState,
    BoardsApiActions.loadBoardsSuccess({ boards: [older, newer] }),
  );

  it('starts loading only when nothing is cached yet', () => {
    const loading = reducer(initialBoardsState, BoardsPageActions.opened());
    expect(loading.status).toBe('loading');

    const refreshing = reducer(loaded, BoardsPageActions.opened());
    expect(refreshing.status).toBe('loaded');
  });

  it('stores boards sorted from newest to oldest', () => {
    expect(loaded.ids).toEqual(['new', 'old']);
    expect(loaded.status).toBe('loaded');
  });

  it('keeps the error message when loading fails', () => {
    const state = reducer(
      initialBoardsState,
      BoardsApiActions.loadBoardsFailure({ error: 'Falhou' }),
    );
    expect(state.status).toBe('error');
    expect(state.error).toBe('Falhou');
  });

  it('adds a board optimistically and removes it if the API rejects it', () => {
    const board = makeBoard({ id: 'tmp', createdAt: '2026-09-01T00:00:00.000Z' });
    const created = reducer(loaded, BoardsPageActions.createBoard({ board }));
    expect(created.ids[0]).toBe('tmp');

    const rolledBack = reducer(created, BoardsApiActions.createBoardFailure({ board, error: 'x' }));
    expect(rolledBack.ids).toEqual(['new', 'old']);
  });

  it('restores the previous version when an update fails', () => {
    const renamed = { ...older, title: 'Renomeado' };
    const updated = reducer(
      loaded,
      BoardsPageActions.updateBoard({ board: renamed, previous: older }),
    );
    expect(updated.entities['old']?.title).toBe('Renomeado');

    const rolledBack = reducer(
      updated,
      BoardsApiActions.updateBoardFailure({ previous: older, error: 'x' }),
    );
    expect(rolledBack.entities['old']?.title).toBe(older.title);
  });

  it('puts a deleted board back when the delete fails', () => {
    const deleted = reducer(loaded, BoardsPageActions.deleteBoard({ board: older }));
    expect(deleted.ids).toEqual(['new']);

    const rolledBack = reducer(
      deleted,
      BoardsApiActions.deleteBoardFailure({ board: older, error: 'x' }),
    );
    expect(rolledBack.ids).toEqual(['new', 'old']);
  });

  it('caches a board opened through a deep link', () => {
    const board = makeBoard({ id: 'deep' });
    const state = reducer(
      initialBoardsState,
      BoardApiActions.loadBoardSuccess({ board, columns: [], cards: [] }),
    );
    expect(state.entities['deep']).toEqual(board);
  });
});
