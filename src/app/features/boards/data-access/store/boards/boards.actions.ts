import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Board } from '../../../models/board.model';

/** Events triggered by the user on the boards list. */
export const BoardsPageActions = createActionGroup({
  source: 'Boards Page',
  events: {
    Opened: emptyProps(),
    'Create Board': props<{ board: Board }>(),
    /** `previous` is kept so the optimistic update can be rolled back. */
    'Update Board': props<{ board: Board; previous: Board }>(),
    'Delete Board': props<{ board: Board }>(),
  },
});

/** Results coming back from the boards API. */
export const BoardsApiActions = createActionGroup({
  source: 'Boards API',
  events: {
    'Load Boards Success': props<{ boards: Board[] }>(),
    'Load Boards Failure': props<{ error: string }>(),
    'Create Board Success': props<{ board: Board }>(),
    'Create Board Failure': props<{ board: Board; error: string }>(),
    'Update Board Success': props<{ board: Board }>(),
    'Update Board Failure': props<{ previous: Board; error: string }>(),
    'Delete Board Success': props<{ board: Board }>(),
    'Delete Board Failure': props<{ board: Board; error: string }>(),
  },
});
