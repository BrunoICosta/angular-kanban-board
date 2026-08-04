import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { dialogConfig } from '../dialog.config';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);

  /** Emits `true` when the user confirms, `false` when they cancel or dismiss. */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const ref = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      ...dialogConfig,
      data: { tone: 'danger', ...data },
      ariaLabelledBy: 'confirm-title',
      ariaDescribedBy: 'confirm-message',
      role: 'alertdialog',
    });
    return ref.closed.pipe(map((confirmed) => confirmed === true));
  }
}
