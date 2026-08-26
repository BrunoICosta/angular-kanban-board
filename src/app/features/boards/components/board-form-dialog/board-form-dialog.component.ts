import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { BOARD_COLORS, Board, BoardColorId } from '../../models/board.model';

export interface BoardFormDialogData {
  /** When present the dialog edits this board; otherwise it creates a new one. */
  board?: Board;
}

export interface BoardFormResult {
  title: string;
  color: BoardColorId;
}

export const BOARD_TITLE_MAX_LENGTH = 60;

@Component({
  selector: 'app-board-form-dialog',
  imports: [ReactiveFormsModule, IconComponent, TranslocoPipe],
  templateUrl: './board-form-dialog.component.html',
  styleUrl: './board-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardFormDialogComponent {
  private readonly data = inject<BoardFormDialogData>(DIALOG_DATA, { optional: true });
  protected readonly ref = inject<DialogRef<BoardFormResult>>(DialogRef);

  protected readonly colors = BOARD_COLORS;
  protected readonly maxLength = BOARD_TITLE_MAX_LENGTH;
  protected readonly isEdit = !!this.data?.board;

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: [
      this.data?.board?.title ?? '',
      [Validators.required, Validators.maxLength(BOARD_TITLE_MAX_LENGTH)],
    ],
    color: [this.data?.board?.color ?? ('violet' as BoardColorId)],
  });

  protected submit(): void {
    const title = this.form.controls.title.value.trim();
    if (this.form.invalid || !title) {
      this.form.controls.title.setValue(title);
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close({ title, color: this.form.controls.color.value });
  }
}
