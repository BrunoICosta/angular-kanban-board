import { makeCard, makeColumn } from '../../../testing/fixtures';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';
import { boardDetailFeature, initialBoardDetailState } from './board-detail.reducer';
import { cardsFeature, initialCardsState } from './cards.reducer';
import { columnsFeature, initialColumnsState } from './columns.reducer';

describe('board detail reducers', () => {
  const todo = makeColumn({ id: 'todo', position: 0 });
  const done = makeColumn({ id: 'done', position: 1 });
  const a = makeCard({ id: 'a', columnId: 'todo', position: 0 });
  const b = makeCard({ id: 'b', columnId: 'todo', position: 1 });
  const loadedAction = BoardApiActions.loadBoardSuccess({
    board: { id: 'b1', title: 'Sprint', color: 'violet', createdAt: '' },
    columns: [done, todo],
    cards: [b, a],
  });

  describe('cards', () => {
    const reducer = cardsFeature.reducer;
    const loaded = reducer(initialCardsState, loadedAction);

    it('applies a move immediately and restores the previous cards on failure', () => {
      const moved = [
        { ...a, columnId: 'done', position: 0 },
        { ...b, position: 0 },
      ];
      const afterMove = reducer(loaded, BoardPageActions.moveCard({ moved, previous: [a, b] }));
      expect(afterMove.entities['a']?.columnId).toBe('done');
      expect(afterMove.entities['b']?.position).toBe(0);

      const rolledBack = reducer(
        afterMove,
        BoardApiActions.moveCardFailure({ previous: [a, b], error: 'x' }),
      );
      expect(rolledBack.entities['a']).toEqual(a);
      expect(rolledBack.entities['b']).toEqual(b);
    });

    it('removes the cards of a deleted column and brings them back on failure', () => {
      const afterDelete = reducer(
        loaded,
        BoardPageActions.deleteColumn({ column: todo, cards: [a, b] }),
      );
      expect(afterDelete.ids).toEqual([]);

      const rolledBack = reducer(
        afterDelete,
        BoardApiActions.deleteColumnFailure({ column: todo, cards: [a, b], error: 'x' }),
      );
      expect(rolledBack.ids.length).toBe(2);
    });

    it('rolls back a failed edit', () => {
      const edited = { ...a, title: 'Novo título' };
      const afterEdit = reducer(loaded, BoardPageActions.updateCard({ card: edited, previous: a }));
      const rolledBack = reducer(
        afterEdit,
        BoardApiActions.updateCardFailure({ previous: a, error: 'x' }),
      );
      expect(afterEdit.entities['a']?.title).toBe('Novo título');
      expect(rolledBack.entities['a']?.title).toBe(a.title);
    });
  });

  describe('columns', () => {
    const reducer = columnsFeature.reducer;
    const loaded = reducer(initialColumnsState, loadedAction);

    it('keeps columns ordered by position', () => {
      expect(loaded.ids).toEqual(['todo', 'done']);
    });

    it('rolls back a failed reorder', () => {
      const moved = [
        { ...done, position: 0 },
        { ...todo, position: 1 },
      ];
      const afterMove = reducer(
        loaded,
        BoardPageActions.moveColumn({ moved, previous: [done, todo] }),
      );
      expect(afterMove.ids).toEqual(['done', 'todo']);

      const rolledBack = reducer(
        afterMove,
        BoardApiActions.moveColumnFailure({ previous: [done, todo], error: 'x' }),
      );
      expect(rolledBack.ids).toEqual(['todo', 'done']);
    });
  });

  describe('ui state', () => {
    const reducer = boardDetailFeature.reducer;

    it('counts pending optimistic writes until they settle', () => {
      const card = makeCard();
      let state = reducer(initialBoardDetailState, BoardPageActions.addCard({ card }));
      state = reducer(state, BoardPageActions.addCard({ card: { ...card, id: 'k2' } }));
      expect(state.pendingSaves).toBe(2);

      state = reducer(state, BoardApiActions.addCardSuccess({ card }));
      state = reducer(state, BoardApiActions.addCardFailure({ card, error: 'x' }));
      expect(state.pendingSaves).toBe(0);
    });

    it('toggles label filters and resets them when another board opens', () => {
      let state = reducer(initialBoardDetailState, BoardPageActions.opened({ boardId: 'b1' }));
      state = reducer(state, BoardPageActions.labelFilterToggled({ label: 'bug' }));
      state = reducer(state, BoardPageActions.searchChanged({ query: 'login' }));
      expect(state.filter).toEqual({ query: 'login', labels: ['bug'] });

      state = reducer(state, BoardPageActions.labelFilterToggled({ label: 'bug' }));
      expect(state.filter.labels).toEqual([]);

      state = reducer(state, BoardPageActions.opened({ boardId: 'b2' }));
      expect(state.filter).toEqual({ query: '', labels: [] });
    });
  });
});
