import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { Card, ChecklistItem, LABELS, LabelId } from '../../models/card.model';
import { Column } from '../../models/column.model';
import { ChecklistEditorComponent } from '../checklist-editor/checklist-editor.component';

export interface CardDetailDialogData {
  card: Card;
  columns: Column[];
}

export type CardDetailResult = { type: 'save'; card: Card } | { type: 'delete' };

export const CARD_TITLE_MAX_LENGTH = 120;
export const CARD_DESCRIPTION_MAX_LENGTH = 2000;

@Component({
  selector: 'app-card-detail-dialog',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    IconComponent,
    AvatarComponent,
    ChecklistEditorComponent,
  ],
  templateUrl: './card-detail-dialog.component.html',
  styleUrl: './card-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDetailDialogComponent {
  protected readonly data = inject<CardDetailDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<CardDetailResult>>(DialogRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly allLabels = LABELS;
  protected readonly titleMax = CARD_TITLE_MAX_LENGTH;
  protected readonly descriptionMax = CARD_DESCRIPTION_MAX_LENGTH;

  protected readonly form = this.fb.group({
    title: [
      this.data.card.title,
      [Validators.required, Validators.maxLength(CARD_TITLE_MAX_LENGTH)],
    ],
    description: [this.data.card.description, [Validators.maxLength(CARD_DESCRIPTION_MAX_LENGTH)]],
    columnId: [this.data.card.columnId],
    assignee: [this.data.card.assignee ?? '', [Validators.maxLength(60)]],
    dueDate: [this.data.card.dueDate ?? ''],
    labels: [[...this.data.card.labels] as LabelId[]],
  });

  protected readonly checklist = signal<ChecklistItem[]>(this.data.card.checklist);
  protected readonly assignee = toSignal(this.form.controls.assignee.valueChanges, {
    initialValue: this.form.controls.assignee.value,
  });
  protected readonly selectedLabels = toSignal(this.form.controls.labels.valueChanges, {
    initialValue: this.form.controls.labels.value,
  });

  protected toggleLabel(id: LabelId): void {
    const labels = this.form.controls.labels.value;
    this.form.controls.labels.setValue(
      labels.includes(id) ? labels.filter((label) => label !== id) : [...labels, id],
    );
    this.form.markAsDirty();
  }

  protected save(): void {
    const title = this.form.controls.title.value.trim();
    if (this.form.invalid || !title) {
      this.form.controls.title.setValue(title);
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    // Keep labels in the canonical order so equal sets compare equal.
    const labels = LABELS.map((label) => label.id).filter((id) => value.labels.includes(id));
    this.ref.close({
      type: 'save',
      card: {
        ...this.data.card,
        title,
        description: value.description.trim(),
        columnId: value.columnId,
        assignee: value.assignee.trim() || null,
        dueDate: value.dueDate || null,
        labels,
        checklist: this.checklist(),
      },
    });
  }

  protected remove(): void {
    this.ref.close({ type: 'delete' });
  }
}
