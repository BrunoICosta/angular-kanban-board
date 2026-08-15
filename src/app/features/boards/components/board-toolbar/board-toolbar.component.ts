import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { CardFilter } from '../../models/card-filter.model';
import { LABELS, LabelId } from '../../models/card.model';

/** Search box + label chips used to filter the cards of a board. */
@Component({
  selector: 'app-board-toolbar',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './board-toolbar.component.html',
  styleUrl: './board-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardToolbarComponent {
  readonly filter = input.required<CardFilter>();
  readonly summary = input.required<{ total: number; visible: number }>();
  readonly active = input(false);

  readonly searchChanged = output<string>();
  readonly labelToggled = output<LabelId>();
  readonly cleared = output<void>();

  protected readonly labels = LABELS;
  protected readonly search = new FormControl('', { nonNullable: true });

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => this.searchChanged.emit(query));

    // Keep the input in sync when the filter is reset from outside (e.g. "Limpar filtros").
    effect(() => {
      const query = this.filter().query;
      if (query !== this.search.value) {
        this.search.setValue(query, { emitEvent: false });
      }
    });
  }

  protected clear(): void {
    this.search.setValue('', { emitEvent: false });
    this.cleared.emit();
  }
}
