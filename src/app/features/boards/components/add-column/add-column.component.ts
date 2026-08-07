import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';

export const COLUMN_TITLE_MAX_LENGTH = 40;

/** Last "column" of the board: a button that turns into an inline form. */
@Component({
  selector: 'app-add-column',
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    @if (editing()) {
      <form class="add" [formGroup]="form" (ngSubmit)="submit()" (keydown.escape)="cancel()">
        <label class="sr-only" for="new-column-title">Nome da nova coluna</label>
        <input
          #input
          id="new-column-title"
          class="input"
          formControlName="title"
          placeholder="Nome da coluna"
          [attr.maxlength]="maxLength"
        />
        <div class="add__actions">
          <button type="submit" class="btn btn--primary btn--sm">Adicionar</button>
          <button type="button" class="btn btn--ghost btn--sm" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    } @else {
      <button type="button" class="add__trigger" (click)="start()">
        <app-icon name="plus" [size]="16" />
        Adicionar coluna
      </button>
    }
  `,
  styles: `
    :host {
      display: block;
      flex: 0 0 var(--column-width);
    }

    .add {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.6rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-elevated);

      &__actions {
        display: flex;
        gap: 0.4rem;
      }

      &__trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.8rem 0.9rem;
        border: 1.5px dashed var(--border-strong);
        border-radius: var(--radius-lg);
        background: color-mix(in srgb, var(--bg-elevated) 60%, transparent);
        color: var(--text-muted);
        font-weight: 600;
        cursor: pointer;
        transition:
          border-color var(--transition),
          color var(--transition);

        &:hover {
          border-color: var(--accent);
          color: var(--text);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddColumnComponent {
  readonly add = output<string>();

  protected readonly maxLength = COLUMN_TITLE_MAX_LENGTH;
  protected readonly editing = signal(false);
  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(COLUMN_TITLE_MAX_LENGTH)],
    }),
  });
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly injector = inject(Injector);

  protected start(): void {
    this.editing.set(true);
    // Focus once the input is rendered.
    afterNextRender(() => this.input()?.nativeElement.focus(), { injector: this.injector });
  }

  protected submit(): void {
    const title = this.form.controls.title.value.trim();
    if (!title) {
      this.input()?.nativeElement.focus();
      return;
    }
    this.add.emit(title);
    this.form.reset();
    this.input()?.nativeElement.focus();
  }

  protected cancel(): void {
    this.form.reset();
    this.editing.set(false);
  }
}
