import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';

import { NotificationService } from '../../../../../core/notifications/notification.service';
import { provideI18nTesting } from '../../../../../../testing/i18n-testing';
import { makeBoard } from '../../../testing/fixtures';
import { BoardsApiService } from '../../api/boards-api.service';
import { BoardsApiActions, BoardsPageActions } from './boards.actions';
import { BoardsEffects } from './boards.effects';

describe('BoardsEffects', () => {
  let actions$: Observable<Action>;
  let effects: BoardsEffects;
  let api: jasmine.SpyObj<BoardsApiService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  const board = makeBoard();
  const serverError = new HttpErrorResponse({ status: 503, error: { message: 'Fora do ar.' } });

  beforeEach(() => {
    api = jasmine.createSpyObj<BoardsApiService>('BoardsApiService', [
      'getAll',
      'create',
      'update',
      'delete',
    ]);
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'error',
      'success',
    ]);

    TestBed.configureTestingModule({
      providers: [
        BoardsEffects,
        provideI18nTesting(),
        provideMockActions(() => actions$),
        { provide: BoardsApiService, useValue: api },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    effects = TestBed.inject(BoardsEffects);
  });

  it('loads the boards when the page opens', (done) => {
    api.getAll.and.returnValue(of([board]));
    actions$ = of(BoardsPageActions.opened());

    effects.loadBoards$.subscribe((action) => {
      expect(action).toEqual(BoardsApiActions.loadBoardsSuccess({ boards: [board] }));
      done();
    });
  });

  it('maps a load error to a translation key', (done) => {
    api.getAll.and.returnValue(throwError(() => serverError));
    actions$ = of(BoardsPageActions.opened());

    effects.loadBoards$.subscribe((action) => {
      expect(action).toEqual(BoardsApiActions.loadBoardsFailure({ error: 'errors.unavailable' }));
      done();
    });
  });

  it('emits a failure carrying the optimistic board so the reducer can remove it', (done) => {
    api.create.and.returnValue(throwError(() => serverError));
    actions$ = of(BoardsPageActions.createBoard({ board }));

    effects.createBoard$.subscribe((action) => {
      expect(action).toEqual(
        BoardsApiActions.createBoardFailure({ board, error: 'errors.unavailable' }),
      );
      done();
    });
  });

  it('emits the previous version when an update fails', (done) => {
    const renamed = { ...board, title: 'Novo' };
    api.update.and.returnValue(throwError(() => serverError));
    actions$ = of(BoardsPageActions.updateBoard({ board: renamed, previous: board }));

    effects.updateBoard$.subscribe((action) => {
      expect(action).toEqual(
        BoardsApiActions.updateBoardFailure({ previous: board, error: 'errors.unavailable' }),
      );
      done();
    });
  });

  it('confirms a successful delete', (done) => {
    api.delete.and.returnValue(of(undefined));
    actions$ = of(BoardsPageActions.deleteBoard({ board }));

    effects.deleteBoard$.subscribe((action) => {
      expect(api.delete).toHaveBeenCalledWith(board.id);
      expect(action).toEqual(BoardsApiActions.deleteBoardSuccess({ board }));
      done();
    });
  });

  it('tells the user when a change is rolled back', () => {
    actions$ = of(BoardsApiActions.deleteBoardFailure({ board, error: 'errors.unavailable' }));

    effects.notifyRollback$.subscribe();

    expect(notifications.error).toHaveBeenCalledWith(
      'O servidor está indisponível no momento. A alteração foi desfeita.',
    );
  });
});
