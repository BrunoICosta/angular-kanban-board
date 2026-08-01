import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { AuthActions } from '../../auth/store/auth.actions';
import { selectUser } from '../../auth/store/auth.reducer';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, IconComponent, AvatarComponent, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly store = inject(Store);
  protected readonly themeService = inject(ThemeService);
  protected readonly user = this.store.selectSignal(selectUser);

  protected logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
