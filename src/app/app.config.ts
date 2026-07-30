import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { routes } from './app.routes';
import { InMemoryDataService } from './mock-api/in-memory-data.service';

/** Path the app is served from (`/` locally, `/angular-kanban-board/` on GitHub Pages). */
const appBasePath = new URL(document.baseURI).pathname;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    // Fake REST backend. It replaces HttpBackend, so everything still goes through HttpClient
    // (and its interceptors); removing this line points the app at a real API.
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
        apiBase: 'api/',
        rootPath: appBasePath,
        delay: 350,
        post204: false,
        put204: false,
      }),
    ),
  ],
};
