import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, forkJoin, map, mergeMap, of, switchMap, tap } from 'rxjs';

import { toErrorMessage } from '../../../../../core/api/http-error';
import { NotificationService } from '../../../../../core/notifications/notification.service';
import { BoardsApiService } from '../../api/boards-api.service';
import { CardsApiService } from '../../api/cards-api.service';
import { ColumnsApiService } from '../../api/columns-api.service';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';

@Injectable()
export class BoardDetailEffects {
  private readonly actions$ = inject(Actions);
  private readonly boardsApi = inject(BoardsApiService);
  private readonly columnsApi = inject(ColumnsApiService);
  private readonly cardsApi = inject(CardsApiService);
  private readonly notifications = inject(NotificationService);

  readonly loadBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.opened),
      // Navigating to another board cancels the previous load.
      switchMap(({ boardId }) =>
        forkJoin({
          board: this.boardsApi.getById(boardId),
          columns: this.columnsApi.getByBoard(boardId),
          cards: this.cardsApi.getByBoard(boardId),
        }).pipe(
          map(({ board, columns, cards }) =>
            BoardApiActions.loadBoardSuccess({ board, columns, cards }),
          ),
          catchError((error: unknown) =>
            of(
              BoardApiActions.loadBoardFailure({
                boardId,
                error:
                  error instanceof HttpErrorResponse && error.status === HttpStatusCode.NotFound
                    ? 'Este quadro não existe ou foi excluído.'
                    : toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly addColumn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.addColumn),
      mergeMap(({ column }) =>
        this.columnsApi.create(column).pipe(
          map((saved) => BoardApiActions.addColumnSuccess({ column: saved })),
          catchError((error: unknown) =>
            of(BoardApiActions.addColumnFailure({ column, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly updateColumn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.updateColumn),
      concatMap(({ column, previous }) =>
        this.columnsApi.update(column).pipe(
          map((saved) => BoardApiActions.updateColumnSuccess({ column: saved })),
          catchError((error: unknown) =>
            of(BoardApiActions.updateColumnFailure({ previous, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly deleteColumn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.deleteColumn),
      mergeMap(({ column, cards }) =>
        this.columnsApi.delete(column.id).pipe(
          map(() => BoardApiActions.deleteColumnSuccess({ column })),
          catchError((error: unknown) =>
            of(
              BoardApiActions.deleteColumnFailure({ column, cards, error: toErrorMessage(error) }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly moveColumn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.moveColumn),
      concatMap(({ moved, previous }) =>
        this.columnsApi.updateMany(moved).pipe(
          map((columns) => BoardApiActions.moveColumnSuccess({ columns })),
          catchError((error: unknown) =>
            of(BoardApiActions.moveColumnFailure({ previous, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly addCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.addCard),
      mergeMap(({ card }) =>
        this.cardsApi.create(card).pipe(
          map((saved) => BoardApiActions.addCardSuccess({ card: saved })),
          catchError((error: unknown) =>
            of(BoardApiActions.addCardFailure({ card, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly updateCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.updateCard),
      concatMap(({ card, previous }) =>
        this.cardsApi.update(card).pipe(
          map((saved) => BoardApiActions.updateCardSuccess({ card: saved })),
          catchError((error: unknown) =>
            of(BoardApiActions.updateCardFailure({ previous, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly deleteCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.deleteCard),
      mergeMap(({ card }) =>
        this.cardsApi.delete(card.id).pipe(
          map(() => BoardApiActions.deleteCardSuccess({ card })),
          catchError((error: unknown) =>
            of(BoardApiActions.deleteCardFailure({ card, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  /**
   * Moves are persisted in order (`concatMap`) so the server sees them in the same sequence
   * the user made them. On failure the reducer restores the cards' previous positions.
   */
  readonly moveCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardPageActions.moveCard),
      concatMap(({ moved, previous }) =>
        this.cardsApi.updateMany(moved).pipe(
          map((cards) => BoardApiActions.moveCardSuccess({ cards })),
          catchError((error: unknown) =>
            of(BoardApiActions.moveCardFailure({ previous, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  /** Every failed optimistic write has already been rolled back by the reducers; tell the user. */
  readonly notifyRollback$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BoardApiActions.addColumnFailure,
          BoardApiActions.updateColumnFailure,
          BoardApiActions.deleteColumnFailure,
          BoardApiActions.moveColumnFailure,
          BoardApiActions.addCardFailure,
          BoardApiActions.moveCardFailure,
          BoardApiActions.updateCardFailure,
          BoardApiActions.deleteCardFailure,
        ),
        tap(({ error }) => this.notifications.error(`${error} A alteração foi desfeita.`)),
      ),
    { dispatch: false },
  );
}
