import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideI18nTesting } from '../../../../../testing/i18n-testing';
import { makeCard } from '../../testing/fixtures';
import { CardItemComponent } from './card-item.component';

describe('CardItemComponent', () => {
  let fixture: ComponentFixture<CardItemComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CardItemComponent],
      providers: [provideI18nTesting()],
    });
    fixture = TestBed.createComponent(CardItemComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('today', '2026-08-15');
  });

  function render(overrides: Parameters<typeof makeCard>[0]) {
    fixture.componentRef.setInput('card', makeCard(overrides));
    fixture.detectChanges();
  }

  it('shows the title, labels and assignee initials', () => {
    render({ title: 'Checkout com Pix', labels: ['backend', 'urgent'], assignee: 'Ana Souza' });

    expect(element.querySelector('.card__title')?.textContent).toContain('Checkout com Pix');
    expect([...element.querySelectorAll('.label')].map((l) => l.textContent?.trim())).toEqual([
      'Backend',
      'Urgente',
    ]);
    expect(element.querySelector('app-avatar')?.textContent?.trim()).toBe('AS');
  });

  it('highlights overdue cards', () => {
    render({ dueDate: '2026-08-10' });

    const badge = element.querySelector('.badge');
    expect(badge?.classList).toContain('badge--danger');
    expect(badge?.textContent).toContain('10 de ago.');
    expect(badge?.textContent).toContain('Atrasado');
  });

  it('shows checklist progress and marks it complete', () => {
    render({
      checklist: [
        { id: '1', text: 'a', done: true },
        { id: '2', text: 'b', done: true },
      ],
    });

    const badge = element.querySelector('.badge--success');
    expect(badge?.textContent?.replace(/\s/g, '')).toBe('2/2');
  });

  it('emits the card when clicked', () => {
    render({ id: 'k42' });
    let opened: string | undefined;
    fixture.componentInstance.open.subscribe((card) => (opened = card.id));

    element.querySelector<HTMLButtonElement>('button.card')?.click();

    expect(opened).toBe('k42');
  });
});
