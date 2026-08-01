import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Credentials, User } from '../auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ credentials: Credentials; returnUrl: string | null }>(),
    'Login Success': props<{ token: string; user: User; returnUrl: string | null }>(),
    'Login Failure': props<{ error: string }>(),
    Logout: emptyProps(),
    /** Dispatched when the API rejects the token (401). */
    'Session Expired': emptyProps(),
  },
});
