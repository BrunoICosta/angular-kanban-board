import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, of, switchMap, tap } from 'rxjs';

import { toErrorKey } from '../../../../../core/api/http-error';
import { NotificationService } from '../../../../../core/notifications/notification.service';
import { BoardsApiService } from '../../api/boards-api.service';
import { BoardsApiActions, BoardsPageActions } from './boards.actions';

@Injectable()
export class BoardsEffects {
  private readonly actions$ = inject(Actions);
  private readonly boardsApi = inject(BoardsApiService);
  private readonly notifications = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  readonly loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsPageActions.opened),
      switchMap(() =>
        this.boardsApi.getAll().pipe(
          map((boards) => BoardsApiActions.loadBoardsSuccess({ boards })),
          catchError((error: unknown) =>
            of(BoardsApiActions.loadBoardsFailure({ error: toErrorKey(error) })),
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
            of(BoardsApiActions.createBoardFailure({ board, error: toErrorKey(error) })),
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
            of(BoardsApiActions.updateBoardFailure({ previous, error: toErrorKey(error) })),
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
            of(BoardsApiActions.deleteBoardFailure({ board, error: toErrorKey(error) })),
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
        tap(({ error }) =>
          this.notifications.error(
            this.transloco.translate('toast.rolledBack', {
              error: this.transloco.translate(error),
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  readonly notifyDeleted$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BoardsApiActions.deleteBoardSuccess),
        tap(({ board }) =>
          this.notifications.success(
            this.transloco.translate('boards.toast.boardDeleted', { title: board.title }),
          ),
        ),
      ),
    { dispatch: false },
  );
}
