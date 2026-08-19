import { createFakeJwt } from '../../../mock-api/fake-jwt';
import { isJwtExpired, decodeJwtPayload } from '../jwt';
import { AuthActions } from './auth.actions';
import { authFeature, authStateFromSession, initialAuthState } from './auth.reducer';

describe('auth reducer', () => {
  const user = { id: 'u1', name: 'Ana Souza', email: 'ana@fluxo.dev' };
  const { reducer, selectIsAuthenticated, selectIsLoggingIn } = authFeature;

  it('tracks the login request and stores the session on success', () => {
    const pending = reducer(
      initialAuthState,
      AuthActions.login({
        credentials: { email: user.email, password: '123456' },
        returnUrl: null,
      }),
    );
    expect(selectIsLoggingIn.projector(pending.status)).toBeTrue();

    const signedIn = reducer(
      pending,
      AuthActions.loginSuccess({ token: 'token', user, returnUrl: null }),
    );
    expect(signedIn).toEqual({ token: 'token', user, status: 'idle', error: null });
    expect(selectIsAuthenticated.projector(signedIn.token)).toBeTrue();
  });

  it('keeps the error message when login fails', () => {
    const state = reducer(initialAuthState, AuthActions.loginFailure({ error: 'Senha curta' }));
    expect(state.error).toBe('Senha curta');
    expect(state.status).toBe('idle');
  });

  it('clears everything on logout and on session expiration', () => {
    const signedIn = authStateFromSession({ token: 'token', user });
    expect(reducer(signedIn, AuthActions.logout())).toEqual(initialAuthState);
    expect(reducer(signedIn, AuthActions.sessionExpired())).toEqual(initialAuthState);
  });
});

describe('fake JWT', () => {
  const user = { id: 'u1', name: 'Ana Souza', email: 'ana@fluxo.dev' };

  it('round-trips the claims through the token payload', () => {
    const now = Date.UTC(2026, 7, 1);
    const token = createFakeJwt(user, now);

    expect(token.split('.').length).toBe(3);
    expect(decodeJwtPayload(token)).toEqual(
      jasmine.objectContaining({ sub: 'u1', name: 'Ana Souza', iat: now / 1000 }),
    );
  });

  it('expires after eight hours', () => {
    const now = Date.UTC(2026, 7, 1);
    const token = createFakeJwt(user, now);
    expect(isJwtExpired(token, now + 7 * 3600 * 1000)).toBeFalse();
    expect(isJwtExpired(token, now + 8 * 3600 * 1000)).toBeTrue();
  });

  it('treats malformed tokens as expired', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(isJwtExpired('a.b.c')).toBeTrue();
  });
});
