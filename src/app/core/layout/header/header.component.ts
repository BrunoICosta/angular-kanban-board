import { CdkMenu, CdkMenuItem, CdkMenuItemCheckbox, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';

import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { AuthActions } from '../../auth/store/auth.actions';
import { selectUser } from '../../auth/store/auth.reducer';
import { DemoSettingsService } from '../../demo/demo-settings.service';
import { LanguageSwitcherComponent } from '../../i18n/language-switcher.component';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    IconComponent,
    AvatarComponent,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    CdkMenuItemCheckbox,
    TranslocoPipe,
    LanguageSwitcherComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly store = inject(Store);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);
  protected readonly themeService = inject(ThemeService);
  protected readonly demo = inject(DemoSettingsService);
  protected readonly user = this.store.selectSignal(selectUser);

  protected restoreSampleData(): void {
    this.confirmDialog
      .confirm({
        title: this.transloco.translate('header.restoreTitle'),
        message: this.transloco.translate('header.restoreMessage'),
        confirmLabel: this.transloco.translate('header.restoreConfirm'),
      })
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.demo.restoreSampleData());
  }

  protected logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
