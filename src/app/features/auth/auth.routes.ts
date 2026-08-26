import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.login',
    // Strings from public/i18n/auth/<lang>.json, loaded together with this lazy route.
    providers: [provideTranslocoScope('auth')],
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
];
