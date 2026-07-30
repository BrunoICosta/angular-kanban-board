export interface Column {
  id: string;
  boardId: string;
  title: string;
  /** Zero-based order of the column inside its board. */
  position: number;
  /** Work-in-progress limit. `null` means unlimited. */
  wipLimit: number | null;
}
