import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { Column } from '../../models/column.model';
import { COLUMN_TITLE_MAX_LENGTH } from '../add-column/add-column.component';

export interface ColumnFormResult {
  title: string;
  wipLimit: number | null;
}

export const MAX_WIP_LIMIT = 99;

@Component({
  selector: 'app-column-form-dialog',
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <form class="dialog dialog--sm" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <header class="dialog__header">
        <h2 class="dialog__title" id="column-form-title">Editar coluna</h2>
        <button type="button" class="icon-btn" aria-label="Fechar" (click)="ref.close()">
          <app-icon name="x" />
        </button>
      </header>

      <div class="field">
        <label class="field__label" for="column-title">Nome</label>
        <input
          id="column-title"
          class="input"
          formControlName="title"
          [attr.maxlength]="maxTitleLength"
          [attr.aria-invalid]="form.controls.title.invalid && form.controls.title.touched"
          aria-describedby="column-title-error"
        />
        @if (form.controls.title.touched && form.controls.title.invalid) {
          <span id="column-title-error" class="field__error">Dê um nome à coluna.</span>
        }
      </div>

      <div class="field">
        <label class="field__label" for="column-wip">Limite de WIP</label>
        <input
          id="column-wip"
          class="input"
          type="number"
          inputmode="numeric"
          min="1"
          [attr.max]="maxWip"
          formControlName="wipLimit"
          placeholder="Sem limite"
          aria-describedby="column-wip-hint"
          [attr.aria-invalid]="form.controls.wipLimit.invalid"
        />
        <span id="column-wip-hint" class="field__hint">
          Quantidade máxima de cartões em andamento nesta coluna. Deixe vazio para não limitar.
        </span>
        @if (form.controls.wipLimit.invalid) {
          <span class="field__error">Use um número inteiro entre 1 e {{ maxWip }}.</span>
        }
      </div>

      <footer class="dialog__footer">
        <button type="button" class="btn btn--ghost" (click)="ref.close()">Cancelar</button>
        <button type="submit" class="btn btn--primary">Salvar</button>
      </footer>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnFormDialogComponent {
  private readonly column = inject<Column>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<ColumnFormResult>>(DialogRef);

  protected readonly maxTitleLength = COLUMN_TITLE_MAX_LENGTH;
  protected readonly maxWip = MAX_WIP_LIMIT;

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: [
      this.column.title,
      [Validators.required, Validators.maxLength(COLUMN_TITLE_MAX_LENGTH)],
    ],
    wipLimit: new FormControl<number | null>(this.column.wipLimit, [
      Validators.min(1),
      Validators.max(MAX_WIP_LIMIT),
      Validators.pattern(/^\d+$/),
    ]),
  });

  protected submit(): void {
    const title = this.form.controls.title.value.trim();
    if (this.form.invalid || !title) {
      this.form.controls.title.setValue(title);
      this.form.markAllAsTouched();
      return;
    }
    const wipLimit = this.form.controls.wipLimit.value;
    this.ref.close({ title, wipLimit: wipLimit ? Number(wipLimit) : null });
  }
}
