import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';

import { selectUser } from '../../../../core/auth/store/auth.reducer';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { dialogConfig } from '../../../../shared/ui/dialog.config';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { createId } from '../../../../shared/utils/id';
import {
  BoardFormDialogComponent,
  BoardFormDialogData,
  BoardFormResult,
} from '../../components/board-form-dialog/board-form-dialog.component';
import { BoardTileComponent } from '../../components/board-tile/board-tile.component';
import { BoardsPageActions } from '../../data-access/store/boards/boards.actions';
import {
  selectAllBoards,
  selectBoardsError,
  selectBoardsStatus,
} from '../../data-access/store/boards/boards.reducer';
import { Board } from '../../models/board.model';

@Component({
  selector: 'app-boards-list-page',
  imports: [BoardTileComponent, EmptyStateComponent, IconComponent, TranslocoPipe],
  templateUrl: './boards-list-page.component.html',
  styleUrl: './boards-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsListPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(Dialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  protected readonly boards = this.store.selectSignal(selectAllBoards);
  protected readonly status = this.store.selectSignal(selectBoardsStatus);
  protected readonly error = this.store.selectSignal(selectBoardsError);
  protected readonly user = this.store.selectSignal(selectUser);
  protected readonly skeletons = [1, 2, 3];

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.store.dispatch(BoardsPageActions.opened());
  }

  protected createBoard(): void {
    this.openForm({}).subscribe(({ title, color }) => {
      const board: Board = { id: createId(), title, color, createdAt: new Date().toISOString() };
      this.store.dispatch(BoardsPageActions.createBoard({ board }));
    });
  }

  protected editBoard(previous: Board): void {
    this.openForm({ board: previous }).subscribe(({ title, color }) => {
      if (title === previous.title && color === previous.color) {
        return;
      }
      this.store.dispatch(
        BoardsPageActions.updateBoard({ board: { ...previous, title, color }, previous }),
      );
    });
  }

  protected deleteBoard(board: Board): void {
    this.confirmDialog
      .confirm({
        title: this.transloco.translate('boards.confirmDeleteBoard.title'),
        message: this.transloco.translate('boards.confirmDeleteBoard.message', {
          title: board.title,
        }),
        confirmLabel: this.transloco.translate('boards.confirmDeleteBoard.confirm'),
      })
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.store.dispatch(BoardsPageActions.deleteBoard({ board })));
  }

  private openForm(data: BoardFormDialogData) {
    return this.dialog
      .open<BoardFormResult, BoardFormDialogData>(BoardFormDialogComponent, {
        ...dialogConfig,
        data,
        ariaLabelledBy: 'board-form-title',
      })
      .closed.pipe(
        filter((result): result is BoardFormResult => !!result),
        takeUntilDestroyed(this.destroyRef),
      );
  }
}
