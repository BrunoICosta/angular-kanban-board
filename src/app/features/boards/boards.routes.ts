import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { BoardsApiService } from './data-access/api/boards-api.service';
import { CardsApiService } from './data-access/api/cards-api.service';
import { ColumnsApiService } from './data-access/api/columns-api.service';
import { BoardDetailEffects } from './data-access/store/board-detail/board-detail.effects';
import { boardDetailFeature } from './data-access/store/board-detail/board-detail.reducer';
import { cardsFeature } from './data-access/store/board-detail/cards.reducer';
import { columnsFeature } from './data-access/store/board-detail/columns.reducer';
import { BoardsEffects } from './data-access/store/boards/boards.effects';
import { boardsFeature } from './data-access/store/boards/boards.reducer';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    // Feature state, effects and API clients are registered here so they ship with this
    // lazy chunk instead of the initial bundle.
    providers: [
      // Strings from public/i18n/boards/<lang>.json, loaded with this chunk.
      provideTranslocoScope('boards'),
      BoardsApiService,
      ColumnsApiService,
      CardsApiService,
      provideState(boardsFeature),
      provideState(boardDetailFeature),
      provideState(columnsFeature),
      provideState(cardsFeature),
      provideEffects(BoardsEffects, BoardDetailEffects),
    ],
    children: [
      {
        path: '',
        title: 'titles.boards',
        loadComponent: () =>
          import('./pages/boards-list/boards-list-page.component').then(
            (m) => m.BoardsListPageComponent,
          ),
      },
      {
        path: ':id',
        title: 'titles.board',
        loadComponent: () =>
          import('./pages/board-page/board-page.component').then((m) => m.BoardPageComponent),
      },
    ],
  },
];
