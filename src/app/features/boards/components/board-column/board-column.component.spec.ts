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

describe('BoardColumnComponent in each language', () => {
  const column = makeColumn({ title: 'Doing', wipLimit: 1 });
  const cards = [
    makeCard({ id: 'a', labels: ['urgent'], dueDate: '2026-08-10' }),
    makeCard({ id: 'b', position: 1 }),
  ];

  function render(lang: 'pt-BR' | 'en'): HTMLElement {
    TestBed.configureTestingModule({
      imports: [BoardColumnComponent],
      providers: [provideI18nTesting(lang)],
    });
    const fixture = TestBed.createComponent(BoardColumnComponent);
    fixture.componentRef.setInput('column', column);
    fixture.componentRef.setInput('cards', cards);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders in Portuguese', () => {
    const element = render('pt-BR');
    expect(element.querySelector('.column__warning')?.textContent).toContain(
      'Limite de WIP excedido (2/1)',
    );
    expect(element.querySelector('.label')?.textContent?.trim()).toBe('Urgente');
    expect(element.querySelector('.badge')?.textContent).toContain('10 de ago.');
    expect(element.querySelector('.inline-add__trigger')?.textContent).toContain(
      'Adicionar cartão',
    );
  });

  it('renders in English', () => {
    const element = render('en');
    expect(element.querySelector('.column__warning')?.textContent).toContain(
      'WIP limit exceeded (2/1)',
    );
    expect(element.querySelector('.label')?.textContent?.trim()).toBe('Urgent');
    expect(element.querySelector('.badge')?.textContent).toContain('Aug 10');
    expect(element.querySelector('.inline-add__trigger')?.textContent).toContain('Add card');
    expect(
      element.querySelector('button[aria-haspopup]')?.getAttribute('aria-label') ??
        element.querySelector('.column__header .icon-btn')?.getAttribute('aria-label'),
    ).toBe('Actions for column Doing');
  });
});
