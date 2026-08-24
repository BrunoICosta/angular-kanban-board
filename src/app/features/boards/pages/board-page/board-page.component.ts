import { Dialog } from '@angular/cdk/dialog';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
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
import { filter, from, switchMap } from 'rxjs';

import { TranslatedTitleStrategy } from '../../../../core/i18n/translated-title.strategy';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { dialogConfig } from '../../../../shared/ui/dialog.config';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { createId } from '../../../../shared/utils/id';
import { AddColumnComponent } from '../../components/add-column/add-column.component';
import { BoardToolbarComponent } from '../../components/board-toolbar/board-toolbar.component';
import {
  BoardColumnComponent,
  CARD_LIST_ID_PREFIX,
  CardDropEvent,
} from '../../components/board-column/board-column.component';
import type {
  CardDetailDialogData,
  CardDetailResult,
} from '../../components/card-detail-dialog/card-detail-dialog.component';
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
  selectFilter,
  selectFilterSummary,
  selectPendingSaves,
  selectIsFiltering,
  selectVisibleCardsByColumn,
} from '../../data-access/store/board-detail/board-detail.selectors';
import { moveCard, reorderColumns } from '../../data-access/utils/reorder';
import { wipStatus } from '../../data-access/utils/wip';
import { boardColorValue } from '../../models/board.model';
import { Card, LabelId } from '../../models/card.model';
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
    BoardToolbarComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
  ],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardPageComponent {
  private readonly store = inject(Store);
  private readonly dialog = inject(Dialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);
  private readonly titleStrategy = inject(TranslatedTitleStrategy);
  private readonly destroyRef = inject(DestroyRef);

  /** Route param `:id` (bound through `withComponentInputBinding`). */
  readonly id = input.required<string>();

  protected readonly board = this.store.selectSignal(selectCurrentBoard);
  protected readonly status = this.store.selectSignal(selectBoardStatus);
  protected readonly error = this.store.selectSignal(selectBoardError);
  protected readonly columns = this.store.selectSignal(selectBoardColumns);
  protected readonly cardsByColumn = this.store.selectSignal(selectCardsByColumn);
  protected readonly visibleCardsByColumn = this.store.selectSignal(selectVisibleCardsByColumn);
  protected readonly filter = this.store.selectSignal(selectFilter);
  protected readonly filterSummary = this.store.selectSignal(selectFilterSummary);
  protected readonly isFiltering = this.store.selectSignal(selectIsFiltering);
  protected readonly isSaving = computed(() => this.pendingSaves() > 0);
  private readonly pendingSaves = this.store.selectSignal(selectPendingSaves);
  protected readonly boardColor = computed(() => {
    const board = this.board();
    return board ? boardColorValue(board.color) : 'var(--accent)';
  });
  /** Every card list is connected to every other one, so cards can move between columns. */
  protected readonly cardListIds = computed(() =>
    this.columns().map((column) => CARD_LIST_ID_PREFIX + column.id),
  );
  protected readonly dragStartDelay = { touch: 180, mouse: 0 };
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

    // The route title is generic ("Quadro"); once the board is known, show its name instead.
    effect(() => {
      const board = this.board();
      if (board) {
        this.titleStrategy.setPageTitle(board.title);
      }
    });
  }

  protected reload(): void {
    this.load(this.id());
  }

  protected search(query: string): void {
    this.store.dispatch(BoardPageActions.searchChanged({ query }));
  }

  protected toggleLabel(label: LabelId): void {
    this.store.dispatch(BoardPageActions.labelFilterToggled({ label }));
  }

  protected clearFilters(): void {
    this.store.dispatch(BoardPageActions.filtersCleared());
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

  protected addCard({ column, title }: { column: Column; title: string }): void {
    const cards = this.cardsByColumn()[column.id] ?? [];
    const card: Card = {
      id: createId(),
      boardId: column.boardId,
      columnId: column.id,
      position: cards.length,
      title,
      description: '',
      labels: [],
      dueDate: null,
      checklist: [],
      assignee: null,
      createdAt: new Date().toISOString(),
    };
    this.store.dispatch(BoardPageActions.addCard({ card }));
  }

  /** The detail dialog is the heaviest piece of UI, so it is lazy-loaded on first use. */
  protected openCard(card: Card): void {
    from(import('../../components/card-detail-dialog/card-detail-dialog.component'))
      .pipe(
        switchMap(
          ({ CardDetailDialogComponent }) =>
            this.dialog.open<CardDetailResult, CardDetailDialogData>(CardDetailDialogComponent, {
              ...dialogConfig,
              data: { card, columns: this.columns() },
              ariaLabelledBy: 'card-dialog-title',
            }).closed,
        ),
        filter((result): result is CardDetailResult => !!result),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) =>
        result.type === 'delete' ? this.deleteCard(card) : this.saveCard(card, result.card),
      );
  }

  private saveCard(previous: Card, edited: Card): void {
    // Content edits and column changes are separate writes: an update, then a regular move.
    const updated: Card = { ...edited, columnId: previous.columnId, position: previous.position };
    if (JSON.stringify(updated) !== JSON.stringify(previous)) {
      this.store.dispatch(BoardPageActions.updateCard({ card: updated, previous }));
    }
    if (edited.columnId !== previous.columnId) {
      const target = this.cardsByColumn()[edited.columnId] ?? [];
      this.dropCard({ cardId: previous.id, toColumnId: edited.columnId, toIndex: target.length });
    }
  }

  private deleteCard(card: Card): void {
    this.confirmDialog
      .confirm({
        title: 'Excluir cartão?',
        message: `"${card.title}" será excluído permanentemente.`,
        confirmLabel: 'Excluir cartão',
      })
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.store.dispatch(BoardPageActions.deleteCard({ card })));
  }

  protected dropCard({ cardId, toColumnId, toIndex }: CardDropEvent): void {
    const cardsByColumn = this.cardsByColumn();
    const { moved, previous } = moveCard(cardsByColumn, cardId, toColumnId, toIndex);
    if (!moved.length) {
      return;
    }
    this.store.dispatch(BoardPageActions.moveCard({ moved, previous }));

    const target = this.columns().find((column) => column.id === toColumnId);
    const cameFromAnotherColumn = previous.some(
      (card) => card.id === cardId && card.columnId !== toColumnId,
    );
    const countAfter = (cardsByColumn[toColumnId]?.length ?? 0) + 1;
    if (target && cameFromAnotherColumn && wipStatus(countAfter, target.wipLimit) === 'over') {
      this.notifications.info(
        `"${target.title}" passou do limite de WIP (${countAfter}/${target.wipLimit}).`,
      );
    }
  }

  protected dropColumn(event: CdkDragDrop<Column[]>): void {
    this.reorderColumn(event.previousIndex, event.currentIndex);
  }

  /** Menu alternative to dragging: moves a column one slot left (-1) or right (+1). */
  protected shiftColumn(index: number, direction: -1 | 1): void {
    this.reorderColumn(index, index + direction);
  }

  private reorderColumn(fromIndex: number, toIndex: number): void {
    const { moved, previous } = reorderColumns(this.columns(), fromIndex, toIndex);
    if (moved.length) {
      this.store.dispatch(BoardPageActions.moveColumn({ moved, previous }));
    }
  }

  private load(boardId: string): void {
    this.store.dispatch(BoardPageActions.opened({ boardId }));
  }
}
