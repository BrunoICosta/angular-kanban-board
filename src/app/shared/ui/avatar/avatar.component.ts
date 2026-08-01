import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { hueFromName, initials } from '../../utils/initials';

@Component({
  selector: 'app-avatar',
  template: `{{ initials() }}`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex-shrink: 0;
      width: var(--avatar-size);
      height: var(--avatar-size);
      border-radius: 50%;
      background: hsl(var(--avatar-hue) 70% 42%);
      color: #fff;
      font-size: calc(var(--avatar-size) * 0.4);
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1;
      user-select: none;
    }
  `,
  host: {
    role: 'img',
    '[attr.aria-label]': 'name() || "Sem responsável"',
    '[attr.title]': 'name()',
    '[style.--avatar-size.px]': 'size()',
    '[style.--avatar-hue]': 'hue()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  readonly name = input<string | null>(null);
  readonly size = input(28);

  protected readonly initials = computed(() => initials(this.name()));
  protected readonly hue = computed(() => hueFromName(this.name()));
}
