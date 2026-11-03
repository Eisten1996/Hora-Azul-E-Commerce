import * as fc from 'fast-check';
import { CARD_CATEGORY_LABELS, CardCategory, CardSummary } from '../models';
import {
  CatalogFilters,
  EMPTY_FILTERS,
  PRICE_RANGES,
  PriceRange,
  filterCards,
  filtersFromParams,
  filtersToParams,
} from './catalog-filter';
import { SAMPLE_CARDS } from './testing/cards.fixture';

const CATEGORIES = Object.keys(CARD_CATEGORY_LABELS) as CardCategory[];
const RANGES = Object.keys(PRICE_RANGES) as PriceRange[];

function names(cards: CardSummary[]): string[] {
  return cards.map((card) => card.name);
}

describe('filterCards', () => {
  it('sin filtros devuelve todas las tarjetas', () => {
    expect(filterCards(SAMPLE_CARDS, EMPTY_FILTERS)).toEqual(SAMPLE_CARDS);
  });

  it('filtra por varias categorías a la vez', () => {
    const result = filterCards(SAMPLE_CARDS, { ...EMPTY_FILTERS, categories: ['FLORES', 'AMOR'] });
    expect(names(result)).toEqual(['Rosa Eterna', 'Corazón Dorado']);
  });

  it('los rangos de precio son inclusivos', () => {
    expect(names(filterCards(SAMPLE_CARDS, { ...EMPTY_FILTERS, priceRange: 'HASTA_17' }))).toEqual([
      'Globos de Cumpleaños',
      'Rosa Eterna',
    ]);
    expect(names(filterCards(SAMPLE_CARDS, { ...EMPTY_FILTERS, priceRange: 'DESDE_30' }))).toEqual([
      'Corazón Dorado',
    ]);
  });

  it('la búsqueda ignora mayúsculas y acentos y mira nombre y descripción', () => {
    expect(names(filterCards(SAMPLE_CARDS, { ...EMPTY_FILTERS, search: 'CORAZON' }))).toEqual([
      'Corazón Dorado',
    ]);
    expect(names(filterCards(SAMPLE_CARDS, { ...EMPTY_FILTERS, search: 'profundidad' }))).toEqual([
      'Rosa Eterna',
    ]);
  });

  it('combina todos los criterios como intersección', () => {
    const filters: CatalogFilters = { categories: ['FLORES', 'AMOR'], priceRange: 'HASTA_20', search: 'rosa' };
    expect(names(filterCards(SAMPLE_CARDS, filters))).toEqual(['Rosa Eterna']);
  });

  it('un texto de solo espacios no filtra', () => {
    expect(filterCards(SAMPLE_CARDS, { ...EMPTY_FILTERS, search: '   ' })).toHaveLength(3);
  });
});

describe('query params de filtros', () => {
  it('ida y vuelta conserva los filtros', () => {
    const filters: CatalogFilters = { categories: ['FLORES', 'AMOR'], priceRange: 'HASTA_20', search: 'rosa' };
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it('acepta una sola categoría como string e ignora valores desconocidos', () => {
    expect(filtersFromParams({ categoria: 'FLORES', precio: 'BARATO' })).toEqual({
      categories: ['FLORES'],
      priceRange: null,
      search: '',
    });
    expect(filtersFromParams({ categoria: ['XYZ', 'AMOR'] }).categories).toEqual(['AMOR']);
  });

  it('los filtros vacíos eliminan todos los parámetros', () => {
    expect(filtersToParams(EMPTY_FILTERS)).toEqual({ categoria: null, precio: null, q: null });
  });
});

// Feature: hora-azul-ecommerce, Propiedad 5: Corrección del filtrado del catálogo
// Validates: Requirements 2.3, 2.4, 2.7
describe('filterCards — propiedad P5', () => {
  /** Oráculo independiente de la implementación para comparar texto sin acentos. */
  const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const wordArb = fc.constantFrom('rosa', 'Corazón', 'GLOBOS', 'árbol', 'luna', 'estrellas', 'Ñandú', 'feliz');
  const textArb = fc.array(wordArb, { minLength: 1, maxLength: 4 }).map((words) => words.join(' '));

  const cardArb: fc.Arbitrary<CardSummary> = fc.record({
    id: fc.uuid(),
    catalogNumber: fc.integer({ min: 1, max: 33 }),
    name: textArb,
    category: fc.constantFrom(...CATEGORIES),
    price: fc.oneof(fc.constantFrom(15, 17, 20, 30), fc.integer({ min: 1, max: 6000 }).map((c) => c / 100)),
    dimensions: fc.constant(null),
    description3d: fc.option(textArb, { nil: null }),
    envelopeIncluded: fc.boolean(),
    coverImageUrl: fc.constant(null),
  });

  const filtersArb: fc.Arbitrary<CatalogFilters> = fc.record({
    categories: fc.subarray(CATEGORIES),
    priceRange: fc.option(fc.constantFrom(...RANGES), { nil: null }),
    search: fc.oneof(fc.constant(''), wordArb, wordArb.map((w) => w.slice(0, 3).toUpperCase())),
  });

  function satisfies(card: CardSummary, filters: CatalogFilters): boolean {
    const search = plain(filters.search.trim());
    const price = card.price;
    const priceOk =
      filters.priceRange === null ||
      (filters.priceRange === 'HASTA_15' && price <= 15) ||
      (filters.priceRange === 'HASTA_17' && price <= 17) ||
      (filters.priceRange === 'HASTA_20' && price <= 20) ||
      (filters.priceRange === 'DESDE_30' && price >= 30);
    return (
      (filters.categories.length === 0 || filters.categories.includes(card.category)) &&
      priceOk &&
      (search === '' || plain(card.name).includes(search) || plain(card.description3d ?? '').includes(search))
    );
  }

  it('el resultado contiene exactamente las tarjetas que cumplen todos los criterios activos', () => {
    fc.assert(
      fc.property(fc.array(cardArb, { maxLength: 40 }), filtersArb, (cards, filters) => {
        const result = filterCards(cards, filters);

        expect(result.every((card) => satisfies(card, filters))).toBe(true);
        expect(result).toEqual(cards.filter((card) => satisfies(card, filters)));
      }),
    );
  });
});
