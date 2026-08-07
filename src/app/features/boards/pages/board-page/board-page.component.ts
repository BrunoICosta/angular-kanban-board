import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';

import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { dialogConfig } from '../../../../shared/ui/dialog.config';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { createId } from '../../../../shared/utils/id';
import { AddColumnComponent } from '../../components/add-column/add-column.component';
import { BoardColumnComponent } from '../../components/board-column/board-column.component';
import {
  ColumnFormDialogComponent,
  ColumnFormResult,
} from '../../components/column-form-dialog/column-form-dialog.component';
import { BoardPageActions } from '../../data-access/store/board-detail/board-detail.actions';
import {
  selectBoardColumns,
  selectBoardError,
  selectBoardStatus,
  selectCardsByColumn,
  selectCurrentBoard,
} from '../../data-access/store/board-detail/board-detail.selectors';
import { boardColorValue } from '../../models/board.model';
import { Column } from '../../models/column.model';

const DEFAULT_COLUMNS = ['A fazer', 'Em andamento', 'Concluído'];

@Component({
  selector: 'app-board-page',
  imports: [
    RouterLink,
    IconComponent,
    EmptyStateComponent,
    BoardColumnComponent,
    AddColumnComponent,
  ],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardPageComponent {
  private readonly store = inject(Store);
  private readonly dialog = inject(Dialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

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

  protected addColumn(title: string): void {
    const columns = this.columns();
    const position = columns.length ? Math.max(...columns.map((c) => c.position)) + 1 : 0;
    const column: Column = { id: createId(), boardId: this.id(), title, position, wipLimit: null };
    this.store.dispatch(BoardPageActions.addColumn({ column }));
  }

  protected addDefaultColumns(): void {
    DEFAULT_COLUMNS.forEach((title) => this.addColumn(title));
  }

  protected editColumn(previous: Column): void {
    this.dialog
      .open<ColumnFormResult, Column>(ColumnFormDialogComponent, {
        ...dialogConfig,
        data: previous,
        ariaLabelledBy: 'column-form-title',
      })
      .closed.pipe(
        filter((result): result is ColumnFormResult => !!result),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ title, wipLimit }) => {
        if (title === previous.title && wipLimit === previous.wipLimit) {
          return;
        }
        this.store.dispatch(
          BoardPageActions.updateColumn({ column: { ...previous, title, wipLimit }, previous }),
        );
      });
  }

  protected deleteColumn(column: Column): void {
    const cards = this.cardsByColumn()[column.id] ?? [];
    const message = cards.length
      ? `A coluna "${column.title}" e seus ${cards.length} cartões serão excluídos.`
      : `A coluna "${column.title}" será excluída.`;
    this.confirmDialog
      .confirm({ title: 'Excluir coluna?', message, confirmLabel: 'Excluir coluna' })
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.store.dispatch(BoardPageActions.deleteColumn({ column, cards })));
  }

  private load(boardId: string): void {
    this.store.dispatch(BoardPageActions.opened({ boardId }));
  }
}
