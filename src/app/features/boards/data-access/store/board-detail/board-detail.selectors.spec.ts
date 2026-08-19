import { makeBoard, makeCard, makeColumn } from '../../../testing/fixtures';
import { boardsAdapter, initialBoardsState } from '../boards/boards.reducer';
import { initialBoardDetailState } from './board-detail.reducer';
import {
  selectBoardColumns,
  selectCardsByColumn,
  selectCurrentBoard,
  selectFilterSummary,
  selectIsFiltering,
  selectVisibleCardsByColumn,
} from './board-detail.selectors';
import { cardsAdapter, initialCardsState } from './cards.reducer';
import { columnsAdapter, initialColumnsState } from './columns.reducer';

describe('board detail selectors', () => {
  const board = makeBoard({ id: 'b1' });
  const columns = [
    makeColumn({ id: 'todo', position: 0 }),
    makeColumn({ id: 'done', position: 1 }),
    makeColumn({ id: 'other-board', boardId: 'b2', position: 0 }),
  ];
  const cards = [
    makeCard({ id: 'a', columnId: 'todo', position: 1, title: 'Login', labels: ['bug'] }),
    makeCard({ id: 'b', columnId: 'todo', position: 0, title: 'Cadastro' }),
    makeCard({ id: 'c', columnId: 'done', position: 0, title: 'Deploy', labels: ['bug'] }),
  ];

  function state(filter = { query: '', labels: [] as ('bug' | 'docs')[] }) {
    return {
      boards: boardsAdapter.setAll([board], initialBoardsState),
      columns: columnsAdapter.setAll(columns, initialColumnsState),
      cards: cardsAdapter.setAll(cards, initialCardsState),
      boardDetail: { ...initialBoardDetailState, boardId: 'b1', status: 'loaded' as const, filter },
    };
  }

  it('selects the open board and only its columns', () => {
    expect(selectCurrentBoard(state())).toEqual(board);
    expect(selectBoardColumns(state()).map((c) => c.id)).toEqual(['todo', 'done']);
  });

  it('groups cards by column ordered by position', () => {
    const grouped = selectCardsByColumn(state());
    expect(grouped['todo']?.map((c) => c.id)).toEqual(['b', 'a']);
    expect(grouped['done']?.map((c) => c.id)).toEqual(['c']);
  });

  it('returns the same grouping when no filter is active', () => {
    const s = state();
    expect(selectIsFiltering(s)).toBeFalse();
    expect(selectVisibleCardsByColumn(s)).toBe(selectCardsByColumn(s));
  });

  it('filters visible cards and summarizes the result', () => {
    const s = state({ query: '', labels: ['bug'] });
    const visible = selectVisibleCardsByColumn(s);

    expect(selectIsFiltering(s)).toBeTrue();
    expect(visible['todo']?.map((c) => c.id)).toEqual(['a']);
    expect(visible['done']?.map((c) => c.id)).toEqual(['c']);
    expect(selectFilterSummary(s)).toEqual({ total: 3, visible: 2 });
  });
});
