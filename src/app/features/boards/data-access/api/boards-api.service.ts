import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../../core/api/api.config';
import { Board } from '../../models/board.model';

@Injectable()
export class BoardsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/boards`;

  getAll(): Observable<Board[]> {
    return this.http.get<Board[]>(this.url);
  }

  getById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.url}/${encodeURIComponent(id)}`);
  }

  create(board: Board): Observable<Board> {
    return this.http.post<Board>(this.url, board);
  }

  update(board: Board): Observable<Board> {
    return this.http.put<Board>(`${this.url}/${encodeURIComponent(board.id)}`, board);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.url}/${encodeURIComponent(id)}`).pipe(map(() => undefined));
  }
}
