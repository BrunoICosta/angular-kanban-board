import { InjectionToken } from '@angular/core';

/**
 * Base URL of the REST API. In the demo it points to the in-memory backend; swapping to a real
 * server only requires providing a different value (e.g. `https://api.example.com`).
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'api',
});
