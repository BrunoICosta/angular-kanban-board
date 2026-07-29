import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../header/header.component';

/** Authenticated application frame: sticky header + routed content. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main id="main" class="shell__main" tabindex="-1">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }

    .shell__main {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;

      &:focus {
        outline: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
