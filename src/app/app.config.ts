import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { loadSession } from './core/auth/session-storage';
import { AuthEffects } from './core/auth/store/auth.effects';
import { authFeature, authStateFromSession } from './core/auth/store/auth.reducer';
import { AppState } from './core/store/app.state';
import { mockApiErrorInterceptor } from './mock-api/mock-api-error.interceptor';
import { provideMockApi } from './mock-api/provide-mock-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // The mock error normalizer must stay last (closest to the backend).
    provideHttpClient(withInterceptors([authInterceptor, mockApiErrorInterceptor])),
    provideMockApi(),
    provideStore<AppState>(
      { auth: authFeature.reducer, router: routerReducer },
      {
        // Restore the session persisted by a previous visit (if still valid).
        initialState: () => ({ auth: authStateFromSession(loadSession()) }),
        runtimeChecks: {
          strictActionTypeUniqueness: true,
        },
      },
    ),
    provideEffects(AuthEffects),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 50, logOnly: !isDevMode(), name: 'Fluxo Kanban' }),
  ],
};
