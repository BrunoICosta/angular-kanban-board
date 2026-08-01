import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { isJwtExpired } from './jwt';
import { AuthActions } from './store/auth.actions';
import { selectToken } from './store/auth.reducer';

/** Lets authenticated users through; everyone else goes to `/login?returnUrl=...`. */
export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const token = store.selectSignal(selectToken)();

  if (token && !isJwtExpired(token)) {
    return true;
  }
  if (token) {
    // A token exists but is no longer valid: clear the stale session from the store/storage.
    store.dispatch(AuthActions.sessionExpired());
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps signed-in users away from the login page. */
export const guestGuard: CanActivateFn = () => {
  const token = inject(Store).selectSignal(selectToken)();
  return token && !isJwtExpired(token) ? inject(Router).createUrlTree(['/boards']) : true;
};
