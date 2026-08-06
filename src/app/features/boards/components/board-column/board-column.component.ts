import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Card } from '../../models/card.model';
import { Column } from '../../models/column.model';
import { CardItemComponent } from '../card-item/card-item.component';

@Component({
  selector: 'app-board-column',
  imports: [CardItemComponent],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumnComponent {
  readonly column = input.required<Column>();
  readonly cards = input.required<Card[]>();
  readonly openCard = output<Card>();
}
