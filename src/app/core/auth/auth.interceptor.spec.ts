import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { authInterceptor } from './auth.interceptor';
import { AuthActions } from './store/auth.actions';
import { selectToken } from './store/auth.reducer';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideMockStore({ selectors: [{ selector: selectToken, value: 'jwt-token' }] }),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  afterEach(() => httpMock.verify());

  it('adds the bearer token to API requests', () => {
    http.get('api/boards').subscribe();

    const req = httpMock.expectOne('api/boards');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush([]);
  });

  it('does not send the token to the login endpoint or to other hosts', () => {
    http.post('api/auth/login', {}).subscribe();
    http.get('https://example.com/data').subscribe();

    expect(httpMock.expectOne('api/auth/login').request.headers.has('Authorization')).toBeFalse();
    expect(
      httpMock.expectOne('https://example.com/data').request.headers.has('Authorization'),
    ).toBeFalse();
  });

  it('ends the session when the API answers 401', () => {
    http.get('api/boards').subscribe({ error: () => undefined });

    httpMock.expectOne('api/boards').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(store.dispatch).toHaveBeenCalledWith(AuthActions.sessionExpired());
  });

  it('lets other errors through untouched', () => {
    let status = 0;
    http
      .get('api/boards')
      .subscribe({ error: (error: { status: number }) => (status = error.status) });

    httpMock.expectOne('api/boards').flush(null, { status: 503, statusText: 'Unavailable' });

    expect(status).toBe(503);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
