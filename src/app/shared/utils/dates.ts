/** Local calendar date as `yyyy-MM-dd`. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return toIsoDate(new Date(year, month - 1, day + days));
}

export type DueStatus = 'overdue' | 'today' | 'soon' | 'later';

/** Classifies a due date relative to `today` (both `yyyy-MM-dd`; plain string comparison works). */
export function dueStatus(dueDate: string | null, today: string): DueStatus | null {
  if (!dueDate) {
    return null;
  }
  if (dueDate < today) {
    return 'overdue';
  }
  if (dueDate === today) {
    return 'today';
  }
  return dueDate <= addDays(today, 2) ? 'soon' : 'later';
}
