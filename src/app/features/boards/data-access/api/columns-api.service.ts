import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../../core/api/api.config';
import { Column } from '../../models/column.model';

@Injectable()
export class ColumnsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/columns`;

  getByBoard(boardId: string): Observable<Column[]> {
    return this.http.get<Column[]>(this.url, { params: { boardId } });
  }

  create(column: Column): Observable<Column> {
    return this.http.post<Column>(this.url, column);
  }

  update(column: Column): Observable<Column> {
    return this.http.put<Column>(`${this.url}/${encodeURIComponent(column.id)}`, column);
  }

  /**
   * Persists several columns at once (used after a reorder). A real API would expose a batch
   * endpoint; here it fans out to one PUT per column and fails if any of them fails.
   */
  updateMany(columns: Column[]): Observable<Column[]> {
    return columns.length ? forkJoin(columns.map((column) => this.update(column))) : of([]);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.url}/${encodeURIComponent(id)}`).pipe(map(() => undefined));
  }
}
