import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { selectUser } from '../../../../core/auth/store/auth.reducer';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { BoardTileComponent } from '../../components/board-tile/board-tile.component';
import { BoardsPageActions } from '../../data-access/store/boards/boards.actions';
import {
  selectAllBoards,
  selectBoardsError,
  selectBoardsStatus,
} from '../../data-access/store/boards/boards.reducer';

@Component({
  selector: 'app-boards-list-page',
  imports: [BoardTileComponent, EmptyStateComponent, IconComponent],
  templateUrl: './boards-list-page.component.html',
  styleUrl: './boards-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsListPageComponent implements OnInit {
  private readonly store = inject(Store);

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
}
