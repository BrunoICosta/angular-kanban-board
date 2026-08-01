import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-boards-list-page',
  template: `
    <section class="page">
      <h1>Meus quadros</h1>
    </section>
  `,
  styles: `
    .page {
      padding: 1.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsListPageComponent {}
