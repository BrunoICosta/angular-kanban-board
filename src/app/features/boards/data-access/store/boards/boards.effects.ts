import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, of, switchMap, tap } from 'rxjs';

import { toErrorMessage } from '../../../../../core/api/http-error';
import { NotificationService } from '../../../../../core/notifications/notification.service';
import { BoardsApiService } from '../../api/boards-api.service';
import { BoardsApiActions, BoardsPageActions } from './boards.actions';

@Injectable()
export class BoardsEffects {
  private readonly actions$ = inject(Actions);
  private readonly boardsApi = inject(BoardsApiService);
  private readonly notifications = inject(NotificationService);

  readonly loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsPageActions.opened),
      switchMap(() =>
        this.boardsApi.getAll().pipe(
          map((boards) => BoardsApiActions.loadBoardsSuccess({ boards })),
          catchError((error: unknown) =>
            of(BoardsApiActions.loadBoardsFailure({ error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly createBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsPageActions.createBoard),
      mergeMap(({ board }) =>
        this.boardsApi.create(board).pipe(
          map((saved) => BoardsApiActions.createBoardSuccess({ board: saved })),
          catchError((error: unknown) =>
            of(BoardsApiActions.createBoardFailure({ board, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  /** `concatMap` keeps consecutive edits of the same board in order. */
  readonly updateBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsPageActions.updateBoard),
      concatMap(({ board, previous }) =>
        this.boardsApi.update(board).pipe(
          map((saved) => BoardsApiActions.updateBoardSuccess({ board: saved })),
          catchError((error: unknown) =>
            of(BoardsApiActions.updateBoardFailure({ previous, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly deleteBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsPageActions.deleteBoard),
      mergeMap(({ board }) =>
        this.boardsApi.delete(board.id).pipe(
          map(() => BoardsApiActions.deleteBoardSuccess({ board })),
          catchError((error: unknown) =>
            of(BoardsApiActions.deleteBoardFailure({ board, error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  readonly notifyRollback$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BoardsApiActions.createBoardFailure,
          BoardsApiActions.updateBoardFailure,
          BoardsApiActions.deleteBoardFailure,
        ),
        tap(({ error }) => this.notifications.error(`${error} A alteração foi desfeita.`)),
      ),
    { dispatch: false },
  );

  readonly notifyDeleted$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BoardsApiActions.deleteBoardSuccess),
        tap(({ board }) => this.notifications.success(`Quadro "${board.title}" excluído.`)),
      ),
    { dispatch: false },
  );
}
