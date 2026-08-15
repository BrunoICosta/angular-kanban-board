export type WipStatus = 'none' | 'ok' | 'at-limit' | 'over';

/** WIP limits are soft: the board still accepts the card but flags the column. */
export function wipStatus(count: number, limit: number | null): WipStatus {
  if (limit === null || limit <= 0) {
    return 'none';
  }
  if (count > limit) {
    return 'over';
  }
  return count === limit ? 'at-limit' : 'ok';
}
