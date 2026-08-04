import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { Board, boardColorValue } from '../../models/board.model';

@Component({
  selector: 'app-board-tile',
  imports: [RouterLink, DatePipe, IconComponent, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  templateUrl: './board-tile.component.html',
  styleUrl: './board-tile.component.scss',
  host: { '[style.--board-color]': 'color()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardTileComponent {
  readonly board = input.required<Board>();
  readonly edit = output<Board>();
  readonly remove = output<Board>();

  protected readonly color = computed(() => boardColorValue(this.board().color));
}
