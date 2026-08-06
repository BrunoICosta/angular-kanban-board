import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';

import { Column } from '../../../models/column.model';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';

export type ColumnsState = EntityState<Column>;

export const columnsAdapter = createEntityAdapter<Column>({
  sortComparer: (a, b) => a.position - b.position,
});

export const initialColumnsState: ColumnsState = columnsAdapter.getInitialState();

export const columnsFeature = createFeature({
  name: 'columns',
  reducer: createReducer(
    initialColumnsState,
    on(BoardPageActions.opened, (state) => columnsAdapter.removeAll(state)),
    on(BoardApiActions.loadBoardSuccess, (state, { columns }) =>
      columnsAdapter.setAll(columns, state),
    ),
  ),
  extraSelectors: ({ selectColumnsState }) => {
    const { selectAll, selectEntities } = columnsAdapter.getSelectors(selectColumnsState);
    return { selectAllColumns: selectAll, selectColumnEntities: selectEntities };
  },
});
