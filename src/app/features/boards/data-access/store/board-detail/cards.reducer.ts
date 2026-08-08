import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';

import { Card } from '../../../models/card.model';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';

export type CardsState = EntityState<Card>;

export const cardsAdapter = createEntityAdapter<Card>({
  sortComparer: (a, b) => a.position - b.position,
});

export const initialCardsState: CardsState = cardsAdapter.getInitialState();

export const cardsFeature = createFeature({
  name: 'cards',
  reducer: createReducer(
    initialCardsState,
    on(BoardPageActions.opened, (state) => cardsAdapter.removeAll(state)),
    on(BoardApiActions.loadBoardSuccess, (state, { cards }) => cardsAdapter.setAll(cards, state)),
    on(BoardPageActions.deleteColumn, (state, { cards }) =>
      cardsAdapter.removeMany(
        cards.map((card) => card.id),
        state,
      ),
    ),
    on(BoardApiActions.deleteColumnFailure, (state, { cards }) =>
      cardsAdapter.addMany(cards, state),
    ),

    // Optimistic writes: apply immediately, undo on failure.
    on(BoardPageActions.addCard, (state, { card }) => cardsAdapter.addOne(card, state)),
    on(BoardApiActions.addCardFailure, (state, { card }) => cardsAdapter.removeOne(card.id, state)),
    on(BoardPageActions.moveCard, (state, { moved }) => cardsAdapter.upsertMany(moved, state)),
    on(BoardApiActions.moveCardFailure, (state, { previous }) =>
      cardsAdapter.upsertMany(previous, state),
    ),
  ),
  extraSelectors: ({ selectCardsState }) => {
    const { selectAll, selectEntities } = cardsAdapter.getSelectors(selectCardsState);
    return { selectAllCards: selectAll, selectCardEntities: selectEntities };
  },
});
