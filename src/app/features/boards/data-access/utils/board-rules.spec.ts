import { addDays, dueStatus } from '../../../../shared/utils/dates';
import { initials } from '../../../../shared/utils/initials';
import { makeCard } from '../../testing/fixtures';
import { isFilterActive, matchesFilter, normalizeText } from './card-filter';
import { checklistProgress } from './checklist-progress';
import { wipStatus } from './wip';

describe('board rules', () => {
  describe('wipStatus', () => {
    it('classifies a column against its WIP limit', () => {
      expect(wipStatus(5, null)).toBe('none');
      expect(wipStatus(1, 3)).toBe('ok');
      expect(wipStatus(3, 3)).toBe('at-limit');
      expect(wipStatus(4, 3)).toBe('over');
    });
  });

  describe('checklistProgress', () => {
    it('counts done items and rounds the percentage', () => {
      const progress = checklistProgress([
        { id: '1', text: 'a', done: true },
        { id: '2', text: 'b', done: false },
        { id: '3', text: 'c', done: false },
      ]);
      expect(progress).toEqual({ done: 1, total: 3, percent: 33, complete: false });
    });

    it('treats an empty checklist as not complete', () => {
      expect(checklistProgress([])).toEqual({ done: 0, total: 0, percent: 0, complete: false });
    });
  });

  describe('card filter', () => {
    const card = makeCard({
      title: 'Integração com pagamento',
      description: 'Webhooks idempotentes',
      labels: ['backend', 'urgent'],
      assignee: 'Ana Souza',
    });

    it('normalizes accents and case', () => {
      expect(normalizeText('  Ação RÁPIDA ')).toBe('acao rapida');
    });

    it('matches every search term against title, description and assignee', () => {
      expect(matchesFilter(card, { query: 'integracao ana', labels: [] })).toBeTrue();
      expect(matchesFilter(card, { query: 'webhooks', labels: [] })).toBeTrue();
      expect(matchesFilter(card, { query: 'integracao bruno', labels: [] })).toBeFalse();
    });

    it('requires at least one of the selected labels', () => {
      expect(matchesFilter(card, { query: '', labels: ['bug', 'urgent'] })).toBeTrue();
      expect(matchesFilter(card, { query: '', labels: ['design'] })).toBeFalse();
    });

    it('knows when a filter is active', () => {
      expect(isFilterActive({ query: '  ', labels: [] })).toBeFalse();
      expect(isFilterActive({ query: '', labels: ['bug'] })).toBeTrue();
    });
  });

  describe('dates', () => {
    it('adds days across month boundaries', () => {
      expect(addDays('2026-08-30', 3)).toBe('2026-09-02');
    });

    it('classifies due dates relative to today', () => {
      const today = '2026-08-15';
      expect(dueStatus(null, today)).toBeNull();
      expect(dueStatus('2026-08-14', today)).toBe('overdue');
      expect(dueStatus('2026-08-15', today)).toBe('today');
      expect(dueStatus('2026-08-17', today)).toBe('soon');
      expect(dueStatus('2026-08-30', today)).toBe('later');
    });
  });

  describe('initials', () => {
    it('uses the first and last names', () => {
      expect(initials('Bruno Vinicius Isaac Costa')).toBe('BC');
      expect(initials('marina')).toBe('MA');
      expect(initials('')).toBe('?');
    });
  });
});
