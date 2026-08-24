import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideI18nTesting } from '../../../../../testing/i18n-testing';
import { makeCard, makeColumn } from '../../testing/fixtures';
import { BoardColumnComponent } from './board-column.component';

describe('BoardColumnComponent', () => {
  let fixture: ComponentFixture<BoardColumnComponent>;
  let element: HTMLElement;

  const cards = (count: number) =>
    Array.from({ length: count }, (_, index) => makeCard({ id: `k${index}`, position: index }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardColumnComponent],
      providers: [provideI18nTesting()],
    });
    fixture = TestBed.createComponent(BoardColumnComponent);
    element = fixture.nativeElement as HTMLElement;
  });

  function render(wipLimit: number | null, cardCount: number, totalCount: number | null = null) {
    fixture.componentRef.setInput('column', makeColumn({ title: 'Em andamento', wipLimit }));
    fixture.componentRef.setInput('cards', cards(cardCount));
    fixture.componentRef.setInput('totalCount', totalCount);
    fixture.detectChanges();
  }

  it('renders one item per card', () => {
    render(null, 3);
    expect(element.querySelectorAll('app-card-item').length).toBe(3);
    expect(element.querySelector('.column__count')?.textContent?.trim()).toBe('3');
  });

  it('does not warn while the column is under its WIP limit', () => {
    render(3, 2);
    expect(element.querySelector('.column__warning')).toBeNull();
    expect(element.querySelector('.wip')?.classList).not.toContain('wip--over');
  });

  it('marks the column when it reaches the limit', () => {
    render(3, 3);
    expect(element.querySelector('.column--at-limit')).not.toBeNull();
    expect(element.querySelector('.column__warning')).toBeNull();
  });

  it('shows a warning when the WIP limit is exceeded', () => {
    render(2, 3);
    expect(element.querySelector('.column--over')).not.toBeNull();
    expect(element.querySelector('.column__warning')?.textContent).toContain(
      'Limite de WIP excedido (3/2)',
    );
  });

  it('uses the total count (not the filtered one) for WIP and shows visible/total', () => {
    render(2, 1, 3);
    expect(element.querySelector('.column__count')?.textContent?.trim()).toBe('1/3');
    expect(element.querySelector('.column__warning')).not.toBeNull();
  });
});
