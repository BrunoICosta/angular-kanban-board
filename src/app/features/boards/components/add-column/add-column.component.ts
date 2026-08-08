import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { InlineAddFormComponent } from '../../../../shared/ui/inline-add-form/inline-add-form.component';

export const COLUMN_TITLE_MAX_LENGTH = 40;

/** Last "column" of the board, used to append new columns. */
@Component({
  selector: 'app-add-column',
  imports: [InlineAddFormComponent],
  template: `
    <app-inline-add-form
      triggerLabel="Adicionar coluna"
      inputLabel="Nome da nova coluna"
      placeholder="Nome da coluna"
      [maxLength]="maxLength"
      (submitted)="add.emit($event)"
    />
  `,
  styles: `
    :host {
      display: block;
      flex: 0 0 var(--column-width);
      padding: 0.35rem;
      border: 1.5px dashed var(--border-strong);
      border-radius: var(--radius-lg);
      background: color-mix(in srgb, var(--bg-elevated) 60%, transparent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddColumnComponent {
  readonly add = output<string>();

  protected readonly maxLength = COLUMN_TITLE_MAX_LENGTH;
}
