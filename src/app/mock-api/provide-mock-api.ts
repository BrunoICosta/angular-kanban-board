import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

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
