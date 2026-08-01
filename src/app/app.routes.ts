import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { ShellComponent } from './core/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'boards' },
      {
        path: 'boards',
        loadChildren: () => import('./features/boards/boards.routes').then((m) => m.BOARDS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'boards' },
];
