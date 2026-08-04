import { DialogConfig } from '@angular/cdk/dialog';

/** Shared look and behavior for every CDK dialog in the app (see `.dialog-*` in styles.scss). */
export const dialogConfig: Pick<
  DialogConfig,
  'panelClass' | 'backdropClass' | 'autoFocus' | 'restoreFocus' | 'maxWidth'
> = {
  panelClass: 'dialog-panel',
  backdropClass: 'dialog-backdrop',
  autoFocus: 'first-tabbable',
  restoreFocus: true,
  maxWidth: 'calc(100vw - 2rem)',
};
