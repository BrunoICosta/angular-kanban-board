import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

export const APP_NAME = 'Fluxo';

/**
 * Route `title`s are translation keys (e.g. `titles.boards`). The document title is translated
 * and kept up to date when the language changes.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private subscription?: Subscription;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.subscription?.unsubscribe();
    if (!key) {
      this.title.setTitle(APP_NAME);
      return;
    }
    this.subscription = this.transloco
      .selectTranslate(key)
      .subscribe((text: string) => this.title.setTitle(`${text} · ${APP_NAME}`));
  }

  /** For pages whose title is data (e.g. a board name) rather than a translation. */
  setPageTitle(text: string): void {
    this.subscription?.unsubscribe();
    this.title.setTitle(`${text} · ${APP_NAME}`);
  }
}
