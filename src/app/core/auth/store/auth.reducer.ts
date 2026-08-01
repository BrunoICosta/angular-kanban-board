import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { User } from '../auth.models';
import { Session } from '../session.storage';
import { AuthActions } from './auth.actions';

export interface AuthState {
  token: string | null;
  user: User | null;
  status: 'idle' | 'pending';
  error: string | null;
}

export const initialAuthState: AuthState = {
  token: null,
  user: null,
  status: 'idle',
  error: null,
};

/** Builds the initial auth slice from a persisted session (used at bootstrap). */
export function authStateFromSession(session: Session | null): AuthState {
  return session
    ? { ...initialAuthState, token: session.token, user: session.user }
    : initialAuthState;
}

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,
    on(AuthActions.login, (state): AuthState => ({ ...state, status: 'pending', error: null })),
    on(AuthActions.loginSuccess, (state, { token, user }): AuthState => ({
      ...state,
      token,
      user,
      status: 'idle',
    })),
    on(AuthActions.loginFailure, (state, { error }): AuthState => ({
      ...state,
      status: 'idle',
      error,
    })),
    on(AuthActions.logout, AuthActions.sessionExpired, (): AuthState => initialAuthState),
  ),
  extraSelectors: ({ selectToken, selectStatus }) => ({
    selectIsAuthenticated: createSelector(selectToken, (token) => token !== null),
    selectIsLoggingIn: createSelector(selectStatus, (status) => status === 'pending'),
  }),
});

export const {
  selectToken,
  selectUser,
  selectError: selectAuthError,
  selectIsAuthenticated,
  selectIsLoggingIn,
} = authFeature;
