import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { InMemoryDataService } from './in-memory-data.service';

/**
 * Registers the fake REST backend. It replaces `HttpBackend`, so requests still flow through
 * HttpClient and its interceptors; removing this provider points the app at a real API.
 */
export function provideMockApi(): EnvironmentProviders {
  return importProvidersFrom(
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
      // Relative URLs such as `api/boards` are resolved by the library against the host root
      // (it ignores <base href>), so the default rootPath works on GitHub Pages too.
      apiBase: 'api/',
      delay: 350,
      post204: false,
      put204: false,
    }),
  );
}
