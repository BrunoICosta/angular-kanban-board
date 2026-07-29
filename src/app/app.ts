import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <a class="skip-link" href="#main">Pular para o conteúdo</a>
    <router-outlet />
  `,
  styles: `
    .skip-link {
      position: fixed;
      top: 0.5rem;
      left: 0.5rem;
      z-index: 1000;
      padding: 0.5rem 0.9rem;
      border-radius: var(--radius-md);
      background: var(--accent);
      color: var(--accent-contrast);
      font-weight: 600;
      transform: translateY(-200%);
      transition: transform var(--transition);

      &:focus {
        transform: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
