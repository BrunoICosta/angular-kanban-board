import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';

import { toErrorMessage } from '../../api/http-error';
import { AuthApiService } from '../auth-api.service';
import { clearSession, saveSession } from '../session-storage';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      // Ignore double submits while a login request is in flight.
      exhaustMap(({ credentials, returnUrl }) =>
        this.authApi.login(credentials).pipe(
          map(({ token, user }) => AuthActions.loginSuccess({ token, user, returnUrl })),
          catchError((error: unknown) =>
            of(
              AuthActions.loginFailure({
                error: toErrorMessage(error, 'Não foi possível entrar.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ token, user, returnUrl }) => {
          saveSession({ token, user });
          void this.router.navigateByUrl(returnUrl || '/boards');
        }),
      ),
    { dispatch: false },
  );

  readonly logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout, AuthActions.sessionExpired),
        tap((action) => {
          clearSession();
          const expired = action.type === AuthActions.sessionExpired.type;
          void this.router.navigate(['/login'], {
            queryParams: expired ? { expired: 1 } : {},
          });
        }),
      ),
    { dispatch: false },
  );
}
