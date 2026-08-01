import { HttpErrorResponse } from '@angular/common/http';

/** Turns any error thrown by HttpClient (or elsewhere) into a user-facing message in pt-BR. */
export function toErrorMessage(
  error: unknown,
  fallback = 'Algo deu errado. Tente novamente.',
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Sem conexão com o servidor.';
    }
    const body: unknown = error.error;
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
    if (error.status >= 500) {
      return 'O servidor está indisponível no momento.';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
