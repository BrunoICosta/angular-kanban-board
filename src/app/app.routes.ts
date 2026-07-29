import { Routes } from '@angular/router';

import { ShellComponent } from './core/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [],
  },
  { path: '**', redirectTo: '' },
];
