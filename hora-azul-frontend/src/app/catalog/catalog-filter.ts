import { Params } from '@angular/router';
import { CARD_CATEGORY_LABELS, CardCategory, CardSummary } from '../models';

/** Rangos de precio excluyentes del requerimiento 2.2 (límites inclusivos). */
export type PriceRange = 'HASTA_15' | 'HASTA_17' | 'HASTA_20' | 'DESDE_30';

export const PRICE_RANGES: Record<PriceRange, { label: string; matches: (price: number) => boolean }> = {
  HASTA_15: { label: 'Hasta S/. 15.00', matches: (price) => price <= 15 },
  HASTA_17: { label: 'Hasta S/. 17.00', matches: (price) => price <= 17 },
  HASTA_20: { label: 'Hasta S/. 20.00', matches: (price) => price <= 20 },
  DESDE_30: { label: 'Desde S/. 30.00', matches: (price) => price >= 30 },
};

/** Filtros del catálogo que el cliente aplica en el navegador. */
export interface CatalogFilters {
  categories: CardCategory[];
  priceRange: PriceRange | null;
  search: string;
}

export const EMPTY_FILTERS: CatalogFilters = { categories: [], priceRange: null, search: '' };

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return filters.categories.length > 0 || filters.priceRange !== null || filters.search.trim() !== '';
}

/** Minúsculas y sin acentos, para comparar texto sin distinguir mayúsculas ni tildes. */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Devuelve las tarjetas que cumplen todos los filtros activos (intersección):
 * alguna de las categorías elegidas (basta con que la tarjeta tenga una de ellas),
 * el rango de precio y el texto en el nombre o la descripción.
 */
export function filterCards(cards: CardSummary[], filters: CatalogFilters): CardSummary[] {
  const search = normalizeText(filters.search.trim());
  const range = filters.priceRange ? PRICE_RANGES[filters.priceRange] : null;

  return cards.filter(
    (card) =>
      (filters.categories.length === 0 ||
        card.categories.some((category) => filters.categories.includes(category))) &&
      (!range || range.matches(card.price)) &&
      (!search ||
        normalizeText(card.name).includes(search) ||
        normalizeText(card.description3d ?? '').includes(search)),
  );
}

// -----------------------------------------------------------------------------
// Query params: ?categoria=FLORES&categoria=AMOR&precio=HASTA_20&q=rosa
// -----------------------------------------------------------------------------

/** Lee los filtros de los query params, ignorando valores desconocidos. */
export function filtersFromParams(params: Params): CatalogFilters {
  const rawCategories: unknown[] = [params['categoria'] ?? []].flat();
  const categories = Object.keys(CARD_CATEGORY_LABELS).filter((category) =>
    rawCategories.includes(category),
  ) as CardCategory[];
  const price = params['precio'];
  const search = params['q'];

  return {
    categories,
    priceRange: typeof price === 'string' && price in PRICE_RANGES ? (price as PriceRange) : null,
    search: typeof search === 'string' ? search : '',
  };
}

/** Query params para {@code router.navigate}; {@code null} elimina el parámetro de la URL. */
export function filtersToParams(filters: CatalogFilters): Params {
  return {
    categoria: filters.categories.length > 0 ? filters.categories : null,
    precio: filters.priceRange,
    q: filters.search !== '' ? filters.search : null,
  };
}
