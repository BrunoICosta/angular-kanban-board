import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { DateFormatOptions, TranslocoDatePipe } from '@jsverse/transloco-locale';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { Board, boardColorValue } from '../../models/board.model';

@Component({
  selector: 'app-board-tile',
  imports: [
    RouterLink,
    TranslocoPipe,
    TranslocoDatePipe,
    IconComponent,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItem,
  ],
  templateUrl: './board-tile.component.html',
  styleUrl: './board-tile.component.scss',
  host: { '[style.--board-color]': 'color()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardTileComponent {
  readonly board = input.required<Board>();
  readonly edit = output<Board>();
  readonly remove = output<Board>();

  protected readonly dateFormat: DateFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  protected readonly color = computed(() => boardColorValue(this.board().color));
}
