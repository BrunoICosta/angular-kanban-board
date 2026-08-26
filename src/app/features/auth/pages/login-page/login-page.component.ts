import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Store } from '@ngrx/store';

import { AuthActions } from '../../../../core/auth/store/auth.actions';
import { selectAuthError, selectIsLoggingIn } from '../../../../core/auth/store/auth.reducer';
import { LanguageSwitcherComponent } from '../../../../core/i18n/language-switcher.component';
import { ThemeService } from '../../../../core/theme/theme.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

export const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, IconComponent, TranslocoPipe, LanguageSwitcherComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly store = inject(Store);
  protected readonly themeService = inject(ThemeService);

  /** Bound from the query string (`?returnUrl=/boards/x&expired=1`). */
  readonly returnUrl = input<string>();
  readonly expired = input<string>();

  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  /** Decorative mini board shown next to the form (cards per column). */
  protected readonly previewColumns = [[1, 2, 3], [1, 2], [1]];
  protected readonly showPassword = signal(false);
  protected readonly isLoggingIn = this.store.selectSignal(selectIsLoggingIn);
  protected readonly error = this.store.selectSignal(selectAuthError);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
  });

  protected fillDemoAccount(): void {
    this.form.setValue({ email: 'demo@fluxo.dev', password: 'demo123' });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const returnUrl = this.returnUrl();
    this.store.dispatch(
      AuthActions.login({
        credentials: this.form.getRawValue(),
        // Only allow in-app redirects to avoid open-redirect issues.
        returnUrl: returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : null,
      }),
    );
  }
}
