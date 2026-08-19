import { makeCard, makeColumn } from '../../testing/fixtures';
import { moveCard, moveItem, reorderColumns } from './reorder';

describe('reorder utils', () => {
  describe('moveItem', () => {
    it('moves an item without mutating the source list', () => {
      const list = ['a', 'b', 'c', 'd'];
      expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
      expect(list).toEqual(['a', 'b', 'c', 'd']);
    });

    it('clamps indexes outside the list', () => {
      expect(moveItem(['a', 'b', 'c'], 0, 10)).toEqual(['b', 'c', 'a']);
    });
  });

  describe('reorderColumns', () => {
    const columns = [
      makeColumn({ id: 'todo', position: 0 }),
      makeColumn({ id: 'doing', position: 1 }),
      makeColumn({ id: 'done', position: 2 }),
    ];

    it('returns only the columns whose position changed, with their previous values', () => {
      const { moved, previous } = reorderColumns(columns, 2, 0);

      expect(moved.map((c) => [c.id, c.position])).toEqual([
        ['done', 0],
        ['todo', 1],
        ['doing', 2],
      ]);
      expect(previous.map((c) => [c.id, c.position])).toEqual([
        ['done', 2],
        ['todo', 0],
        ['doing', 1],
      ]);
    });

    it('returns nothing when the column is dropped where it was', () => {
      expect(reorderColumns(columns, 1, 1)).toEqual({ moved: [], previous: [] });
    });
  });

  describe('moveCard', () => {
    const cardsByColumn = {
      todo: [
        makeCard({ id: 'a', columnId: 'todo', position: 0 }),
        makeCard({ id: 'b', columnId: 'todo', position: 1 }),
        makeCard({ id: 'c', columnId: 'todo', position: 2 }),
      ],
      done: [makeCard({ id: 'x', columnId: 'done', position: 0 })],
    };

    it('reorders inside the same column', () => {
      const { moved, previous } = moveCard(cardsByColumn, 'a', 'todo', 2);

      expect(moved.map((c) => [c.id, c.position])).toEqual([
        ['b', 0],
        ['c', 1],
        ['a', 2],
      ]);
      expect(previous.map((c) => c.position)).toEqual([1, 2, 0]);
    });

    it('moves a card to another column and renumbers both columns', () => {
      const { moved, previous } = moveCard(cardsByColumn, 'b', 'done', 0);

      expect(moved.map((c) => [c.id, c.columnId, c.position])).toEqual([
        ['c', 'todo', 1],
        ['b', 'done', 0],
        ['x', 'done', 1],
      ]);
      expect(previous.find((c) => c.id === 'b')).toEqual(cardsByColumn.todo[1]);
    });

    it('is a no-op when the card is dropped at the same place', () => {
      expect(moveCard(cardsByColumn, 'b', 'todo', 1)).toEqual({ moved: [], previous: [] });
    });

    it('ignores unknown cards or columns', () => {
      expect(moveCard(cardsByColumn, 'missing', 'todo', 0).moved).toEqual([]);
      expect(moveCard(cardsByColumn, 'a', 'missing', 0).moved).toEqual([]);
    });
  });
});
