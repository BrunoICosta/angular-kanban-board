import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { Card } from '../../models/card.model';
import { Column } from '../../models/column.model';
import { CardItemComponent } from '../card-item/card-item.component';

@Component({
  selector: 'app-board-column',
  imports: [CardItemComponent, IconComponent, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumnComponent {
  readonly column = input.required<Column>();
  readonly cards = input.required<Card[]>();
  readonly openCard = output<Card>();
  readonly editColumn = output<Column>();
  readonly deleteColumn = output<Column>();
}
