import { Routes } from '@angular/router';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    title: 'Meus quadros · Fluxo',
    loadComponent: () =>
      import('./pages/boards-list/boards-list.page').then((m) => m.BoardsListPage),
  },
];
