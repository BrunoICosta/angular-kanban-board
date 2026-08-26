import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

/**
 * Maps any error (usually an `HttpErrorResponse`) to a translation key under `errors.*`.
 * The store keeps keys instead of text, so messages follow language changes and stay testable.
 */
export function toErrorKey(error: unknown, fallback = 'errors.generic'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  switch (error.status) {
    case 0:
      return 'errors.offline';
    case HttpStatusCode.Unauthorized:
      return 'errors.unauthorized';
    case HttpStatusCode.NotFound:
      return 'errors.notFound';
    default:
      return error.status >= 500 ? 'errors.unavailable' : fallback;
  }
}
