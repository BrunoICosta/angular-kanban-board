import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../icon/icon.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'default';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent, TranslocoPipe],
  template: `
    <div class="dialog dialog--sm">
      <header class="dialog__header">
        <h2 class="dialog__title" id="confirm-title">{{ data.title }}</h2>
        <button
          type="button"
          class="icon-btn"
          [attr.aria-label]="'common.close' | transloco"
          (click)="ref.close(false)"
        >
          <app-icon name="x" />
        </button>
      </header>
      <p class="dialog__body" id="confirm-message">{{ data.message }}</p>
      <footer class="dialog__footer">
        <button type="button" class="btn btn--ghost" (click)="ref.close(false)">
          {{ 'common.cancel' | transloco }}
        </button>
        <button
          type="button"
          class="btn"
          [class.btn--danger]="data.tone !== 'default'"
          [class.btn--primary]="data.tone === 'default'"
          (click)="ref.close(true)"
          cdkFocusInitial
        >
          {{ data.confirmLabel ?? ('common.confirm' | transloco) }}
        </button>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}
