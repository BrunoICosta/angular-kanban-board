import { HttpErrorResponse, HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { HttpClientInMemoryWebApiModule, ResponseOptions } from 'angular-in-memory-web-api';
import { catchError, throwError } from 'rxjs';

import { InMemoryDataService } from './in-memory-data.service';

/**
 * Registers the fake REST backend. It replaces `HttpBackend`, so requests still flow through
 * HttpClient and its interceptors; removing this provider points the app at a real API.
 */
export function provideMockApi(): EnvironmentProviders {
  // Path the app is served from (`/` locally, `/angular-kanban-board/` on GitHub Pages).
  const rootPath = new URL(document.baseURI).pathname;
  return importProvidersFrom(
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
      apiBase: 'api/',
      rootPath,
      delay: 350,
      post204: false,
      put204: false,
    }),
  );
}

function isResponseOptions(error: unknown): error is ResponseOptions {
  return typeof error === 'object' && error !== null && 'status' in error && 'url' in error;
}

/**
 * The in-memory backend emits failures as plain `ResponseOptions` objects, while a real backend
 * produces `HttpErrorResponse`. This interceptor (registered last, closest to the backend)
 * normalizes them so the rest of the app only ever deals with `HttpErrorResponse`.
 */
export const mockApiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse || !isResponseOptions(error)) {
        return throwError(() => error);
      }
      return throwError(
        () =>
          new HttpErrorResponse({
            error: error.body,
            headers: error.headers ?? new HttpHeaders(),
            status: error.status,
            statusText: error.statusText,
            url: error.url ?? req.url,
          }),
      );
    }),
  );
