import { CardSummary } from '../../models';

/** Tarjetas de ejemplo para los tests de los componentes del catálogo. */
export const SAMPLE_CARDS: CardSummary[] = [
  {
    id: 'a1000001-0000-0000-0000-000000000001',
    catalogNumber: 1,
    name: 'Globos de Cumpleaños',
    category: 'CUMPLEANOS',
    price: 15,
    dimensions: '15 x 20 cm',
    description3d: 'Tres globos de colores emergen al abrir la tarjeta.',
    envelopeIncluded: true,
    coverImageUrl: 'https://placehold.co/600x400?text=Globos',
  },
  {
    id: 'b2000001-0000-0000-0000-000000000009',
    catalogNumber: 9,
    name: 'Rosa Eterna',
    category: 'FLORES',
    price: 17,
    dimensions: '15 x 20 cm',
    description3d: 'Una rosa roja de tres niveles con efecto de profundidad.',
    envelopeIncluded: true,
    coverImageUrl: null,
  },
  {
    id: 'c3000001-0000-0000-0000-000000000015',
    catalogNumber: 15,
    name: 'Corazón Dorado',
    category: 'AMOR',
    price: 30,
    dimensions: null,
    description3d: null,
    envelopeIncluded: false,
    coverImageUrl: 'https://placehold.co/600x400?text=Corazon',
  },
];
