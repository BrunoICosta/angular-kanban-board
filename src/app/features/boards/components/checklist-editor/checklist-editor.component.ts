import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { createId } from '../../../../shared/utils/id';
import { checklistProgress } from '../../data-access/utils/checklist-progress';
import { ChecklistItem } from '../../models/card.model';

export const CHECKLIST_ITEM_MAX_LENGTH = 140;

/** Editable checklist bound with `[(items)]`. Every change emits a new array (immutable). */
@Component({
  selector: 'app-checklist-editor',
  imports: [ReactiveFormsModule, IconComponent, TranslocoPipe],
  templateUrl: './checklist-editor.component.html',
  styleUrl: './checklist-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistEditorComponent {
  readonly items = model.required<ChecklistItem[]>();

  protected readonly maxLength = CHECKLIST_ITEM_MAX_LENGTH;
  protected readonly progress = computed(() => checklistProgress(this.items()));
  protected readonly text = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(CHECKLIST_ITEM_MAX_LENGTH)],
  });

  protected add(): void {
    const text = this.text.value.trim();
    if (!text) {
      return;
    }
    this.items.update((items) => [...items, { id: createId(), text, done: false }]);
    this.text.reset();
  }

  protected toggle(id: string): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  }

  protected remove(id: string): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
}
