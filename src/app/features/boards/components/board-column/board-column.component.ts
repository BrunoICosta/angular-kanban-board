import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { InlineAddFormComponent } from '../../../../shared/ui/inline-add-form/inline-add-form.component';
import { Card } from '../../models/card.model';
import { Column } from '../../models/column.model';
import { CardItemComponent } from '../card-item/card-item.component';

export interface CardDropEvent {
  cardId: string;
  toColumnId: string;
  toIndex: number;
}

/** Prefix of every card drop list id; columns connect to each other through it. */
export const CARD_LIST_ID_PREFIX = 'card-list-';

@Component({
  selector: 'app-board-column',
  imports: [
    CardItemComponent,
    IconComponent,
    InlineAddFormComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragHandle,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItem,
  ],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumnComponent {
  readonly column = input.required<Column>();
  readonly cards = input.required<Card[]>();
  /** Ids of the other card lists this column accepts cards from / sends cards to. */
  readonly connectedTo = input<string[]>([]);
  /** Whether the column can move left/right (keyboard-friendly alternative to dragging). */
  readonly canMoveLeft = input(false);
  readonly canMoveRight = input(false);
  /** Total cards in the column; differs from `cards().length` while a filter is active. */
  readonly totalCount = input<number | null>(null);
  /** Dragging is turned off while filtering (indexes of a filtered list are ambiguous). */
  readonly dragDisabled = input(false);

  readonly openCard = output<Card>();
  readonly editColumn = output<Column>();
  readonly deleteColumn = output<Column>();
  readonly addCard = output<{ column: Column; title: string }>();
  readonly cardDropped = output<CardDropEvent>();
  readonly moveColumn = output<-1 | 1>();

  protected readonly countLabel = computed(() => {
    const total = this.totalCount() ?? this.cards().length;
    const visible = this.cards().length;
    return visible === total ? `${total}` : `${visible}/${total}`;
  });
  protected readonly listId = computed(() => CARD_LIST_ID_PREFIX + this.column().id);
  /** Short press-and-hold on touch screens so a swipe still scrolls the board. */
  protected readonly dragStartDelay = { touch: 180, mouse: 0 };

  protected onDrop(event: CdkDragDrop<Card[], Card[], string>): void {
    this.cardDropped.emit({
      cardId: event.item.data,
      toColumnId: this.column().id,
      toIndex: event.currentIndex,
    });
  }
}
