import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../../core/api/api.config';
import { Card } from '../../models/card.model';

@Injectable()
export class CardsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/cards`;

  getByBoard(boardId: string): Observable<Card[]> {
    return this.http.get<Card[]>(this.url, { params: { boardId } });
  }

  create(card: Card): Observable<Card> {
    return this.http.post<Card>(this.url, card);
  }

  update(card: Card): Observable<Card> {
    return this.http.put<Card>(`${this.url}/${encodeURIComponent(card.id)}`, card);
  }

  /**
   * Persists every card touched by a drag & drop (new column and/or new positions). A real API
   * would expose a batch "move" endpoint; here it fans out to one PUT per card.
   */
  updateMany(cards: Card[]): Observable<Card[]> {
    return cards.length ? forkJoin(cards.map((card) => this.update(card))) : of([]);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.url}/${encodeURIComponent(id)}`).pipe(map(() => undefined));
  }
}
