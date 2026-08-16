import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

import { mockApiSettings } from '../../mock-api/mock-api.settings';

/**
 * Controls for the demo backend, exposed in the user menu so visitors can see the optimistic
 * updates being rolled back and can reset the sample data.
 */
@Injectable({ providedIn: 'root' })
export class DemoSettingsService {
  private readonly document = inject(DOCUMENT);
  private readonly _simulateFailures = signal(mockApiSettings.simulateFailures);

  readonly simulateFailures = this._simulateFailures.asReadonly();

  toggleSimulateFailures(): void {
    const enabled = !this._simulateFailures();
    mockApiSettings.simulateFailures = enabled;
    this._simulateFailures.set(enabled);
  }

  /** Drops the persisted fake database; the seed data is recreated on reload. */
  restoreSampleData(): void {
    mockApiSettings.clearDb();
    this.document.location.reload();
  }
}
