import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { BoardColumnComponent } from '../../components/board-column/board-column.component';
import { BoardPageActions } from '../../data-access/store/board-detail/board-detail.actions';
import {
  selectBoardColumns,
  selectBoardError,
  selectBoardStatus,
  selectCardsByColumn,
  selectCurrentBoard,
} from '../../data-access/store/board-detail/board-detail.selectors';
import { boardColorValue } from '../../models/board.model';

@Component({
  selector: 'app-board-page',
  imports: [RouterLink, IconComponent, EmptyStateComponent, BoardColumnComponent],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardPageComponent {
  private readonly store = inject(Store);

  /** Route param `:id` (bound through `withComponentInputBinding`). */
  readonly id = input.required<string>();

  protected readonly board = this.store.selectSignal(selectCurrentBoard);
  protected readonly status = this.store.selectSignal(selectBoardStatus);
  protected readonly error = this.store.selectSignal(selectBoardError);
  protected readonly columns = this.store.selectSignal(selectBoardColumns);
  protected readonly cardsByColumn = this.store.selectSignal(selectCardsByColumn);
  protected readonly boardColor = computed(() => {
    const board = this.board();
    return board ? boardColorValue(board.color) : 'var(--accent)';
  });
  protected readonly skeletonColumns = [
    [1, 2, 3, 4],
    [1, 2],
    [1, 2, 3],
  ];

  constructor() {
    effect(() => {
      const boardId = this.id();
      untracked(() => this.load(boardId));
    });
  }

  protected reload(): void {
    this.load(this.id());
  }

  private load(boardId: string): void {
    this.store.dispatch(BoardPageActions.opened({ boardId }));
  }
}
