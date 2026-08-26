import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';

import { AuthApiService } from '../auth-api.service';
import { AuthActions } from './auth.actions';
import { AuthEffects } from './auth.effects';

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;
  let api: jasmine.SpyObj<AuthApiService>;
  let router: jasmine.SpyObj<Router>;

  const credentials = { email: 'ana@fluxo.dev', password: '123456' };
  const user = { id: 'u1', name: 'Ana', email: credentials.email };

  beforeEach(() => {
    api = jasmine.createSpyObj<AuthApiService>('AuthApiService', ['login']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl', 'navigate']);
    router.navigateByUrl.and.resolveTo(true);
    router.navigate.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthApiService, useValue: api },
        { provide: Router, useValue: router },
      ],
    });
    effects = TestBed.inject(AuthEffects);
    localStorage.removeItem('kanban.session');
  });

  afterEach(() => localStorage.removeItem('kanban.session'));

  it('signs in and forwards the return url', (done) => {
    api.login.and.returnValue(of({ token: 'jwt', user }));
    actions$ = of(AuthActions.login({ credentials, returnUrl: '/boards/b1' }));

    effects.login$.subscribe((action) => {
      expect(action).toEqual(
        AuthActions.loginSuccess({ token: 'jwt', user, returnUrl: '/boards/b1' }),
      );
      done();
    });
  });

  it('maps a rejected login to a translation key', (done) => {
    api.login.and.returnValue(
      throwError(
        () => new HttpErrorResponse({ status: 422, error: { message: 'Senha muito curta.' } }),
      ),
    );
    actions$ = of(AuthActions.login({ credentials, returnUrl: null }));

    effects.login$.subscribe((action) => {
      expect(action).toEqual(AuthActions.loginFailure({ error: 'errors.invalidCredentials' }));
      done();
    });
  });

  it('persists the session and redirects after login', () => {
    actions$ = of(AuthActions.loginSuccess({ token: 'jwt', user, returnUrl: null }));

    effects.loginSuccess$.subscribe();

    expect(JSON.parse(localStorage.getItem('kanban.session') ?? '{}')).toEqual({
      token: 'jwt',
      user,
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/boards');
  });

  it('clears the session and flags expiration on the login page', () => {
    localStorage.setItem('kanban.session', '{}');
    actions$ = of(AuthActions.sessionExpired());

    effects.logout$.subscribe();

    expect(localStorage.getItem('kanban.session')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { expired: 1 } });
  });
});
