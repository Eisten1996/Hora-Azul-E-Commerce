import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CardService } from '../../core/card.service';
import { CardCategory, CardDetail, CardImage } from '../../models';
import { ADMIN_REQUEST } from './admin-auth.interceptor';

/** Fila del listado de tarjetas del panel (`GET /api/admin/cards`). */
export interface AdminCard {
  id: string;
  catalogNumber: number;
  name: string;
  categories: CardCategory[];
  price: number;
  coverImageUrl: string | null;
  active: boolean;
}

/** Campos editables de una tarjeta. */
export interface CardPayload {
  name: string;
  categories: CardCategory[];
  price: number;
  dimensions: string | null;
  description3d: string | null;
  envelopeIncluded: boolean;
  images: CardImage[];
}

export interface NewCardPayload extends CardPayload {
  catalogNumber: number;
}

/** Número que se propone para una tarjeta nueva: el mayor existente más 1, incluidas las inactivas. */
export function nextCatalogNumber(cards: Pick<AdminCard, 'catalogNumber'>[]): number {
  return Math.max(0, ...cards.map((card) => card.catalogNumber)) + 1;
}

/** Gestión del catálogo desde el panel. Todo cambio invalida la caché de catálogo de esta pestaña. */
@Injectable({ providedIn: 'root' })
export class AdminCardService {
  private readonly http = inject(HttpClient);
  private readonly cardService = inject(CardService);
  private readonly cardsUrl = `${environment.apiUrl}/api/cards`;
  private readonly context = new HttpContext().set(ADMIN_REQUEST, true);
  private readonly _notice = signal('');

  list(): Observable<AdminCard[]> {
    return this.http.get<AdminCard[]>(`${environment.apiUrl}/api/admin/cards`, { context: this.context });
  }

  get(id: string): Observable<CardDetail> {
    return this.http.get<CardDetail>(`${this.cardsUrl}/${encodeURIComponent(id)}`, { context: this.context });
  }

  create(payload: NewCardPayload): Observable<CardDetail> {
    return this.http
      .post<CardDetail>(this.cardsUrl, payload, { context: this.context })
      .pipe(tap(() => this.cardService.invalidateCache()));
  }

  update(id: string, payload: CardPayload): Observable<CardDetail> {
    return this.http
      .put<CardDetail>(`${this.cardsUrl}/${encodeURIComponent(id)}`, payload, { context: this.context })
      .pipe(tap(() => this.cardService.invalidateCache()));
  }

  setActive(id: string, active: boolean): Observable<unknown> {
    const action = active ? 'activate' : 'deactivate';
    return this.http
      .patch(`${this.cardsUrl}/${encodeURIComponent(id)}/${action}`, null, { context: this.context })
      .pipe(tap(() => this.cardService.invalidateCache()));
  }

  /** Deja un mensaje de éxito para que lo muestre el listado al volver del formulario. */
  setNotice(message: string): void {
    this._notice.set(message);
  }

  takeNotice(): string {
    const message = this._notice();
    this._notice.set('');
    return message;
  }
}
