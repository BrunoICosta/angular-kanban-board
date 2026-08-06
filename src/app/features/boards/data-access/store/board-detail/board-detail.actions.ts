import { createActionGroup, props } from '@ngrx/store';

import { Board } from '../../../models/board.model';
import { Card } from '../../../models/card.model';
import { Column } from '../../../models/column.model';

/** Events triggered by the user on the board page (`/boards/:id`). */
export const BoardPageActions = createActionGroup({
  source: 'Board Page',
  events: {
    Opened: props<{ boardId: string }>(),
  },
});

/** Results coming back from the API for the board page. */
export const BoardApiActions = createActionGroup({
  source: 'Board API',
  events: {
    'Load Board Success': props<{ board: Board; columns: Column[]; cards: Card[] }>(),
    'Load Board Failure': props<{ boardId: string; error: string }>(),
  },
});
