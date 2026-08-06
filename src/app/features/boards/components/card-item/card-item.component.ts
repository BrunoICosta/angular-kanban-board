import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { dueStatus, toIsoDate } from '../../../../shared/utils/dates';
import { Card, LABELS_BY_ID } from '../../models/card.model';
import { checklistProgress } from '../../data-access/utils/checklist-progress';

const DUE_LABELS = {
  overdue: 'Atrasado',
  today: 'Vence hoje',
  soon: 'Vence em breve',
  later: 'Prazo',
} as const;

@Component({
  selector: 'app-card-item',
  imports: [DatePipe, IconComponent, AvatarComponent],
  templateUrl: './card-item.component.html',
  styleUrl: './card-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardItemComponent {
  readonly card = input.required<Card>();
  /** Injected for deterministic rendering/tests; defaults to the current local date. */
  readonly today = input(toIsoDate(new Date()));
  readonly open = output<Card>();

  protected readonly labels = computed(() => this.card().labels.map((id) => LABELS_BY_ID[id]));
  protected readonly progress = computed(() => checklistProgress(this.card().checklist));
  protected readonly dueStatus = computed(() => dueStatus(this.card().dueDate, this.today()));
  protected readonly dueLabel = computed(() => {
    const status = this.dueStatus();
    return status ? DUE_LABELS[status] : '';
  });
}
