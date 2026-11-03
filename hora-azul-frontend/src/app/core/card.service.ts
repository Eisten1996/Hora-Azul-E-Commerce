import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CardDetail, CardFilters, CardListResponse, CardSummary } from '../models';

interface CardCacheEntry {
  data: CardSummary[];
  cachedAt: number;
}

/**
 * Acceso al catálogo (`/api/cards`) con caché en memoria de 5 minutos.
 *
 * <p>Solo se cachea el catálogo completo (sin filtros): el filtrado por categoría,
 * precio y texto se hace en el cliente sobre esa lista. Una consulta con filtros
 * siempre va al backend y no toca la caché.</p>
 */
@Injectable({ providedIn: 'root' })
export class CardService {
  static readonly CACHE_TTL_MS = 5 * 60 * 1000;
  /** El backend limita el tamaño de página a 100; el catálogo tiene 33 tarjetas. */
  private static readonly MAX_PAGE_SIZE = 100;

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/cards`;
  private readonly _cache = signal<CardCacheEntry | null>(null);

  getCards(filters?: CardFilters): Observable<CardSummary[]> {
    if (hasActiveFilters(filters)) {
      return this.fetchCards(filters);
    }

    const cache = this._cache();
    if (cache && Date.now() - cache.cachedAt < CardService.CACHE_TTL_MS) {
      return of(cache.data);
    }
    return this.fetchCards().pipe(
      tap((data) => this._cache.set({ data, cachedAt: Date.now() })),
    );
  }

  /** Siempre consulta al backend para tener el detalle actualizado. */
  getCardById(id: string): Observable<CardDetail> {
    return this.http.get<CardDetail>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  invalidateCache(): void {
    this._cache.set(null);
  }

  private fetchCards(filters?: CardFilters): Observable<CardSummary[]> {
    let params = new HttpParams().set('size', filters?.size ?? CardService.MAX_PAGE_SIZE);
    for (const key of ['category', 'minPrice', 'maxPrice', 'page'] as const) {
      const value = filters?.[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    }
    return this.http
      .get<CardListResponse>(this.baseUrl, { params })
      .pipe(map((response) => response.content));
  }
}

function hasActiveFilters(filters?: CardFilters): boolean {
  return (
    !!filters &&
    Object.values(filters).some((value) => value !== undefined && value !== null)
  );
}
