import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { BoardsApiService } from './data-access/api/boards-api.service';
import { BoardsEffects } from './data-access/store/boards/boards.effects';
import { boardsFeature } from './data-access/store/boards/boards.reducer';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    // Feature state, effects and API clients are registered here so they ship with this
    // lazy chunk instead of the initial bundle.
    providers: [BoardsApiService, provideState(boardsFeature), provideEffects(BoardsEffects)],
    children: [
      {
        path: '',
        title: 'Meus quadros · Fluxo',
        loadComponent: () =>
          import('./pages/boards-list/boards-list-page.component').then(
            (m) => m.BoardsListPageComponent,
          ),
      },
    ],
  },
];
