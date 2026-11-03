/** Categorías temáticas del catálogo (mismos valores que el enum `CardCategory` del backend). */
export type CardCategory =
  | 'CUMPLEANOS'
  | 'FLORES'
  | 'AMOR'
  | 'SIN_MENSAJE'
  | 'MEJORES_DESEOS'
  | 'AGRADECIMIENTO';

/** Etiquetas visibles para cada categoría. */
export const CARD_CATEGORY_LABELS: Record<CardCategory, string> = {
  CUMPLEANOS: 'Cumpleaños',
  FLORES: 'Flores',
  AMOR: 'Amor',
  SIN_MENSAJE: 'Sin Mensaje Predefinido',
  MEJORES_DESEOS: 'Mejores Deseos',
  AGRADECIMIENTO: 'Agradecimiento',
};

/** Nombres de las categorías separados por comas, p. ej. "Flores, Amor". */
export function categoryLabels(categories: CardCategory[]): string {
  return categories.map((category) => CARD_CATEGORY_LABELS[category]).join(', ');
}

export type ImageType = 'COVER' | 'OPEN' | 'ENVELOPE';

export interface CardImage {
  url: string;
  imageType: ImageType;
  sortOrder: number;
}

/** Elemento de la lista del catálogo (`GET /api/cards`). */
export interface CardSummary {
  id: string;
  catalogNumber: number;
  name: string;
  /** Una tarjeta puede estar en varias categorías (en el orden del enum). */
  categories: CardCategory[];
  price: number;
  dimensions: string | null;
  description3d: string | null;
  envelopeIncluded: boolean;
  coverImageUrl: string | null;
}

/** Detalle completo de una tarjeta (`GET /api/cards/{id}`). */
export interface CardDetail extends CardSummary {
  active: boolean;
  images: CardImage[];
  createdAt: string;
  updatedAt: string;
}

/** Respuesta paginada de `GET /api/cards`. */
export interface CardListResponse {
  content: CardSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/** Filtros que acepta `GET /api/cards` como query params. */
export interface CardFilters {
  category?: CardCategory;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}
