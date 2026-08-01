import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { AuthActions } from './store/auth.actions';
import { selectToken } from './store/auth.reducer';

/**
 * Adds `Authorization: Bearer <token>` to API requests and ends the session when the API
 * answers 401 (expired or revoked token).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const apiBaseUrl = inject(API_BASE_URL);

  const isApiRequest = req.url.startsWith(apiBaseUrl);
  const isLoginRequest = req.url.startsWith(`${apiBaseUrl}/auth/`);
  const token = store.selectSignal(selectToken)();

  const request =
    isApiRequest && !isLoginRequest && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.Unauthorized &&
        isApiRequest &&
        !isLoginRequest
      ) {
        store.dispatch(AuthActions.sessionExpired());
      }
      return throwError(() => error);
    }),
  );
};
