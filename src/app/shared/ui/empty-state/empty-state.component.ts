import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  template: `
    <span class="empty__icon" [class.empty__icon--danger]="tone() === 'danger'">
      <app-icon [name]="icon()" [size]="26" />
    </span>
    <h2 class="empty__title">{{ heading() }}</h2>
    @if (description()) {
      <p class="empty__text">{{ description() }}</p>
    }
    <div class="empty__actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      max-width: 420px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      text-align: center;
    }

    .empty__icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      margin-bottom: 0.5rem;
      border-radius: 16px;
      background: var(--accent-soft);
      color: var(--accent-strong);

      &--danger {
        background: var(--danger-soft);
        color: var(--danger);
      }
    }

    .empty__title {
      font-size: 1.1rem;
    }

    .empty__text {
      color: var(--text-muted);
    }

    .empty__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.75rem;

      &:empty {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input<IconName>('board');
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly tone = input<'default' | 'danger'>('default');
}
