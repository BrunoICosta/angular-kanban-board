import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { toErrorMessage } from '../../../../../core/api/http-error';
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
}
