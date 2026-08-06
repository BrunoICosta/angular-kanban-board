import { ChecklistItem } from '../../models/card.model';

export interface ChecklistProgress {
  done: number;
  total: number;
  /** 0-100, rounded. */
  percent: number;
  complete: boolean;
}

export function checklistProgress(items: readonly ChecklistItem[]): ChecklistProgress {
  const total = items.length;
  const done = items.filter((item) => item.done).length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    complete: total > 0 && done === total,
  };
}
