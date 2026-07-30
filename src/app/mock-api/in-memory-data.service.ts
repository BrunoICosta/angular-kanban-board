import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions, STATUS } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';

import { Credentials, LoginResponse, User } from '../core/auth/auth.models';
import { isJwtExpired } from '../core/auth/jwt';
import { createFakeJwt, nameFromEmail } from './fake-jwt';
import { mockApiSettings } from './mock-api.settings';
import { KanbanDb, createSeedDb } from './seed-data';

type Row = Record<string, unknown> & { id: string };

/**
 * Fake REST backend used by the demo (GitHub Pages has no server).
 *
 * Endpoints (all under `api/`):
 * - `POST auth/login`                         -> `{ token, user }`
 * - `GET|POST boards`, `PUT|DELETE boards/:id`
 * - `GET columns?boardId=`, `POST columns`, `PUT|DELETE columns/:id`
 * - `GET cards?boardId=`, `POST cards`, `PUT|DELETE cards/:id`
 *
 * Every endpoint but login requires `Authorization: Bearer <token>`. Data is persisted to
 * localStorage so the demo survives page reloads.
 */
@Injectable()
export class InMemoryDataService implements InMemoryDbService {
  createDb(): KanbanDb {
    const persisted = mockApiSettings.readDb();
    if (persisted) {
      try {
        return JSON.parse(persisted) as KanbanDb;
      } catch {
        mockApiSettings.clearDb();
      }
    }
    return createSeedDb();
  }

  /** Clients send their own UUIDs (needed for optimistic creates); this is only a fallback. */
  genId(): string {
    return crypto.randomUUID();
  }

  get(reqInfo: RequestInfo): Observable<unknown> | undefined {
    const unauthorized = this.checkAuth(reqInfo);
    if (unauthorized) {
      return unauthorized;
    }
    // The default query matching is a case-insensitive regex (`boardId=a` would match `ab`).
    // A real API filters by equality, so do the same here.
    if (reqInfo.id === undefined && reqInfo.query.size > 0 && Array.isArray(reqInfo.collection)) {
      const rows = (reqInfo.collection as Row[]).filter((row) =>
        [...reqInfo.query.entries()].every(([key, values]) => values.includes(String(row[key]))),
      );
      return this.respond(reqInfo, STATUS.OK, rows);
    }
    return undefined;
  }

  post(reqInfo: RequestInfo): Observable<unknown> | undefined {
    if (reqInfo.collectionName === 'auth' && reqInfo.id === 'login') {
      return this.login(reqInfo);
    }
    return this.checkAuth(reqInfo) ?? this.maybeFail(reqInfo);
  }

  put(reqInfo: RequestInfo): Observable<unknown> | undefined {
    return this.checkAuth(reqInfo) ?? this.maybeFail(reqInfo);
  }

  delete(reqInfo: RequestInfo): Observable<unknown> | undefined {
    const rejected = this.checkAuth(reqInfo) ?? this.maybeFail(reqInfo);
    if (rejected) {
      return rejected;
    }
    this.cascadeDelete(reqInfo);
    return undefined;
  }

  /** Persists the database after every successful write handled by the default handlers. */
  responseInterceptor(response: ResponseOptions, reqInfo: RequestInfo): ResponseOptions {
    const isWrite = reqInfo.method !== 'get';
    const succeeded = (response.status ?? 500) < 400;
    if (isWrite && succeeded) {
      mockApiSettings.writeDb(JSON.stringify(reqInfo.utils.getDb()));
    }
    return response;
  }

  private login(reqInfo: RequestInfo): Observable<unknown> {
    const body = reqInfo.utils.getJsonBody(reqInfo.req) as Partial<Credentials> | null;
    const email = body?.email?.trim().toLowerCase() ?? '';
    const password = body?.password ?? '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      return this.respond(reqInfo, STATUS.UNPROCESSABLE_ENTRY, {
        message: 'E-mail inválido ou senha com menos de 6 caracteres.',
      });
    }

    const user: User = { id: `user-${email}`, email, name: nameFromEmail(email) };
    const response: LoginResponse = { token: createFakeJwt(user), user };
    return this.respond(reqInfo, STATUS.OK, response);
  }

  private checkAuth(reqInfo: RequestInfo): Observable<unknown> | undefined {
    const header = (reqInfo.req as HttpRequest<unknown>).headers.get('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
    if (!token || isJwtExpired(token)) {
      return this.respond(reqInfo, STATUS.UNAUTHORIZED, {
        message: 'Sessão inválida ou expirada.',
      });
    }
    return undefined;
  }

  private maybeFail(reqInfo: RequestInfo): Observable<unknown> | undefined {
    if (!mockApiSettings.simulateFailures) {
      return undefined;
    }
    return this.respond(reqInfo, STATUS.SERVICE_UNAVAILABLE, {
      message: 'Falha simulada no servidor.',
    });
  }

  /** Deleting a board removes its columns and cards; deleting a column removes its cards. */
  private cascadeDelete(reqInfo: RequestInfo): void {
    const db = reqInfo.utils.getDb() as KanbanDb;
    const id = String(reqInfo.id);
    if (reqInfo.collectionName === 'boards') {
      db.columns = db.columns.filter((column) => column.boardId !== id);
      db.cards = db.cards.filter((card) => card.boardId !== id);
    } else if (reqInfo.collectionName === 'columns') {
      db.cards = db.cards.filter((card) => card.columnId !== id);
    }
  }

  private respond(reqInfo: RequestInfo, status: number, body: object): Observable<unknown> {
    return reqInfo.utils.createResponse$(() => ({
      status,
      body,
      headers: reqInfo.headers,
      url: reqInfo.url,
    }));
  }
}
