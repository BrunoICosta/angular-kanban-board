import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, Subject, of, throwError } from 'rxjs';

import { NotificationService } from '../../../../../core/notifications/notification.service';
import { provideI18nTesting } from '../../../../../../testing/i18n-testing';
import { makeBoard, makeCard, makeColumn } from '../../../testing/fixtures';
import { BoardsApiService } from '../../api/boards-api.service';
import { CardsApiService } from '../../api/cards-api.service';
import { ColumnsApiService } from '../../api/columns-api.service';
import { BoardApiActions, BoardPageActions } from './board-detail.actions';
import { BoardDetailEffects } from './board-detail.effects';

describe('BoardDetailEffects', () => {
  let actions$: Observable<Action>;
  let effects: BoardDetailEffects;
  let boardsApi: jasmine.SpyObj<BoardsApiService>;
  let columnsApi: jasmine.SpyObj<ColumnsApiService>;
  let cardsApi: jasmine.SpyObj<CardsApiService>;

  const board = makeBoard();
  const column = makeColumn();
  const card = makeCard();

  beforeEach(() => {
    boardsApi = jasmine.createSpyObj<BoardsApiService>('BoardsApiService', ['getById']);
    columnsApi = jasmine.createSpyObj<ColumnsApiService>('ColumnsApiService', [
      'getByBoard',
      'create',
      'updateMany',
    ]);
    cardsApi = jasmine.createSpyObj<CardsApiService>('CardsApiService', [
      'getByBoard',
      'create',
      'update',
      'updateMany',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        BoardDetailEffects,
        provideI18nTesting(),
        provideMockActions(() => actions$),
        { provide: BoardsApiService, useValue: boardsApi },
        { provide: ColumnsApiService, useValue: columnsApi },
        { provide: CardsApiService, useValue: cardsApi },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj<NotificationService>('NotificationService', ['error']),
        },
      ],
    });
    effects = TestBed.inject(BoardDetailEffects);
  });

  describe('loadBoard$', () => {
    it('loads board, columns and cards in parallel', (done) => {
      boardsApi.getById.and.returnValue(of(board));
      columnsApi.getByBoard.and.returnValue(of([column]));
      cardsApi.getByBoard.and.returnValue(of([card]));
      actions$ = of(BoardPageActions.opened({ boardId: board.id }));

      effects.loadBoard$.subscribe((action) => {
        expect(action).toEqual(
          BoardApiActions.loadBoardSuccess({ board, columns: [column], cards: [card] }),
        );
        done();
      });
    });

    it('explains a 404 as a missing board', (done) => {
      boardsApi.getById.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      columnsApi.getByBoard.and.returnValue(of([]));
      cardsApi.getByBoard.and.returnValue(of([]));
      actions$ = of(BoardPageActions.opened({ boardId: 'nope' }));

      effects.loadBoard$.subscribe((action) => {
        expect(action).toEqual(
          BoardApiActions.loadBoardFailure({
            boardId: 'nope',
            error: 'errors.boardNotFound',
          }),
        );
        done();
      });
    });
  });

  describe('moveCard$', () => {
    const previous = [card];
    const moved = [{ ...card, columnId: 'c2', position: 0 }];

    it('persists every card touched by the drop', (done) => {
      cardsApi.updateMany.and.returnValue(of(moved));
      actions$ = of(BoardPageActions.moveCard({ moved, previous }));

      effects.moveCard$.subscribe((action) => {
        expect(cardsApi.updateMany).toHaveBeenCalledWith(moved);
        expect(action).toEqual(BoardApiActions.moveCardSuccess({ cards: moved }));
        done();
      });
    });

    it('returns the previous positions when the server rejects the move', (done) => {
      cardsApi.updateMany.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 503, error: { message: 'Falhou.' } })),
      );
      actions$ = of(BoardPageActions.moveCard({ moved, previous }));

      effects.moveCard$.subscribe((action) => {
        expect(action).toEqual(
          BoardApiActions.moveCardFailure({ previous, error: 'errors.unavailable' }),
        );
        done();
      });
    });

    it('persists consecutive moves one after the other', () => {
      const first = new Subject<typeof moved>();
      const second = new Subject<typeof moved>();
      cardsApi.updateMany.and.returnValues(first, second);
      const source = new Subject<Action>();
      actions$ = source;
      const results: Action[] = [];
      effects.moveCard$.subscribe((action) => results.push(action));

      source.next(BoardPageActions.moveCard({ moved, previous }));
      source.next(BoardPageActions.moveCard({ moved: previous, previous: moved }));
      // The second request only starts once the first one finished (concatMap).
      expect(cardsApi.updateMany).toHaveBeenCalledTimes(1);

      first.next(moved);
      first.complete();
      expect(cardsApi.updateMany).toHaveBeenCalledTimes(2);
      expect(results.length).toBe(1);
    });
  });

  describe('addColumn$', () => {
    it('rolls back an optimistic column when creation fails', (done) => {
      columnsApi.create.and.returnValue(throwError(() => new Error('Erro inesperado')));
      actions$ = of(BoardPageActions.addColumn({ column }));

      effects.addColumn$.subscribe((action) => {
        expect(action).toEqual(
          BoardApiActions.addColumnFailure({ column, error: 'errors.generic' }),
        );
        done();
      });
    });
  });

  describe('deleteCard$', () => {
    it('confirms the deletion', (done) => {
      cardsApi.delete.and.returnValue(of(undefined));
      actions$ = of(BoardPageActions.deleteCard({ card }));

      effects.deleteCard$.subscribe((action) => {
        expect(action).toEqual(BoardApiActions.deleteCardSuccess({ card }));
        done();
      });
    });
  });
});
