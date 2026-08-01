import { RouterReducerState } from '@ngrx/router-store';

import { AuthState } from '../auth/store/auth.reducer';

/** Root (eagerly registered) state. Feature slices are added lazily with `provideState`. */
export interface AppState {
  auth: AuthState;
  router: RouterReducerState;
}
