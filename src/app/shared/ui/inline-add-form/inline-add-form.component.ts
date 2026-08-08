import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/**
 * "+ Add something" button that turns into a one-line form. Enter submits (and keeps the form
 * open for quick consecutive entries), Escape or "Cancelar" closes it.
 */
@Component({
  selector: 'app-inline-add-form',
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    @if (editing()) {
      <form class="inline-add" [formGroup]="form" (ngSubmit)="submit()" (keydown.escape)="cancel()">
        <label class="sr-only" [for]="inputId">{{ inputLabel() }}</label>
        <textarea
          #field
          class="input inline-add__input"
          rows="2"
          [id]="inputId"
          formControlName="value"
          [placeholder]="placeholder()"
          [attr.maxlength]="maxLength()"
          (keydown.enter)="onEnter($event)"
        ></textarea>
        <div class="inline-add__actions">
          <button type="submit" class="btn btn--primary btn--sm">{{ submitLabel() }}</button>
          <button type="button" class="btn btn--ghost btn--sm" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    } @else {
      <button type="button" class="inline-add__trigger" (click)="start()">
        <app-icon name="plus" [size]="16" />
        {{ triggerLabel() }}
      </button>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .inline-add {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      &__input {
        min-height: 0;
        resize: none;
      }

      &__actions {
        display: flex;
        gap: 0.4rem;
      }

      &__trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.55rem 0.6rem;
        border: 0;
        border-radius: var(--radius-md);
        background: transparent;
        color: var(--text-muted);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition:
          background var(--transition),
          color var(--transition);

        &:hover {
          background: var(--surface-hover);
          color: var(--text);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineAddFormComponent {
  readonly triggerLabel = input.required<string>();
  readonly inputLabel = input.required<string>();
  readonly placeholder = input('');
  readonly submitLabel = input('Adicionar');
  readonly maxLength = input(120);
  readonly submitted = output<string>();

  protected readonly inputId = `inline-add-${nextId++}`;
  protected readonly editing = signal(false);
  protected readonly form = new FormGroup({
    value: new FormControl('', { nonNullable: true }),
  });
  private readonly field = viewChild<ElementRef<HTMLTextAreaElement>>('field');
  private readonly injector = inject(Injector);

  protected start(): void {
    this.editing.set(true);
    afterNextRender(() => this.field()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Enter submits; Shift+Enter is left alone (the value is single-line anyway). */
  protected onEnter(event: Event): void {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  protected submit(): void {
    const value = this.form.controls.value.value.trim();
    if (value) {
      this.submitted.emit(value);
    }
    this.form.reset();
    this.field()?.nativeElement.focus();
  }

  protected cancel(): void {
    this.form.reset();
    this.editing.set(false);
  }
}
