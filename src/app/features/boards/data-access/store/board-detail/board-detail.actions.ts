import { createActionGroup, props } from '@ngrx/store';

import { Board } from '../../../models/board.model';
import { Card } from '../../../models/card.model';
import { Column } from '../../../models/column.model';

/** Events triggered by the user on the board page (`/boards/:id`). */
export const BoardPageActions = createActionGroup({
  source: 'Board Page',
  events: {
    Opened: props<{ boardId: string }>(),
    'Add Column': props<{ column: Column }>(),
    /** `previous` is kept so the optimistic update can be rolled back. */
    'Update Column': props<{ column: Column; previous: Column }>(),
    /** `cards` are the column's cards, removed with it and restored on failure. */
    'Delete Column': props<{ column: Column; cards: Card[] }>(),
  },
});

/** Results coming back from the API for the board page. */
export const BoardApiActions = createActionGroup({
  source: 'Board API',
  events: {
    'Load Board Success': props<{ board: Board; columns: Column[]; cards: Card[] }>(),
    'Load Board Failure': props<{ boardId: string; error: string }>(),
    'Add Column Success': props<{ column: Column }>(),
    'Add Column Failure': props<{ column: Column; error: string }>(),
    'Update Column Success': props<{ column: Column }>(),
    'Update Column Failure': props<{ previous: Column; error: string }>(),
    'Delete Column Success': props<{ column: Column }>(),
    'Delete Column Failure': props<{ column: Column; cards: Card[]; error: string }>(),
  },
});
