import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../../shared/ui/icon/icon.component';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-toast-container',
  imports: [IconComponent, TranslocoPipe],
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (toast of notifications.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast--error]="toast.kind === 'error'"
          [class.toast--success]="toast.kind === 'success'"
          [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
        >
          <app-icon [name]="toast.kind === 'success' ? 'check' : 'alert'" [size]="16" />
          <span class="toast__message">{{ toast.message }}</span>
          <button
            type="button"
            class="icon-btn icon-btn--sm"
            [attr.aria-label]="'toast.close' | transloco"
            (click)="notifications.dismiss(toast.id)"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      left: 1rem;
      z-index: 1100;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      pointer-events: none;

      @media (min-width: 640px) {
        left: auto;
        align-items: flex-end;
      }
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: min(100%, 380px);
      padding: 0.6rem 0.5rem 0.6rem 0.85rem;
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
      box-shadow: var(--shadow-lg);
      font-size: 0.88rem;
      pointer-events: auto;
      animation: toast-in 180ms ease-out;

      &--error {
        border-left-color: var(--danger);

        app-icon {
          color: var(--danger);
        }
      }

      &--success {
        border-left-color: var(--success);

        app-icon {
          color: var(--success);
        }
      }

      &__message {
        flex: 1;
      }
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly notifications = inject(NotificationService);
}
