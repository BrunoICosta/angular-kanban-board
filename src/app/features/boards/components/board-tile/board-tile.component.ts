import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Board, boardColorValue } from '../../models/board.model';

@Component({
  selector: 'app-board-tile',
  imports: [RouterLink, DatePipe],
  templateUrl: './board-tile.component.html',
  styleUrl: './board-tile.component.scss',
  host: { '[style.--board-color]': 'color()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardTileComponent {
  readonly board = input.required<Board>();

  protected readonly color = computed(() => boardColorValue(this.board().color));
}
