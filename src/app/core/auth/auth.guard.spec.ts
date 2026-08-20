import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { createFakeJwt } from '../../mock-api/fake-jwt';
import { authGuard, guestGuard } from './auth.guard';
import { AuthActions } from './store/auth.actions';
import { selectToken } from './store/auth.reducer';

describe('auth guards', () => {
  let store: MockStore;
  const user = { id: 'u1', name: 'Ana', email: 'ana@fluxo.dev' };
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/boards/b1' } as RouterStateSnapshot;

  function runAuthGuard() {
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideMockStore()],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('lets users with a valid token in', () => {
    store.overrideSelector(selectToken, createFakeJwt(user));
    expect(runAuthGuard()).toBeTrue();
  });

  it('sends anonymous users to the login page keeping the requested url', () => {
    store.overrideSelector(selectToken, null);
    const result = runAuthGuard() as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fboards%2Fb1');
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('expires stale sessions', () => {
    const issuedYesterday = Date.now() - 24 * 3600 * 1000;
    store.overrideSelector(selectToken, createFakeJwt(user, issuedYesterday));

    expect(runAuthGuard()).toBeInstanceOf(UrlTree);
    expect(store.dispatch).toHaveBeenCalledWith(AuthActions.sessionExpired());
  });

  it('redirects signed-in users away from the login page', () => {
    store.overrideSelector(selectToken, createFakeJwt(user));
    const result = TestBed.runInInjectionContext(() => guestGuard(route, state)) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/boards');
  });
});
