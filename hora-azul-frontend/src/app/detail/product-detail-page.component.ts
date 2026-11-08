import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { CardService } from '../core/card.service';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartService } from '../core/cart.service';
import { SolesPipe, formatSoles } from '../core/money';
import { SeoService, absoluteUrl } from '../core/seo.service';
import { CardDetail, categoryLabels } from '../models';
import { ImageGalleryComponent } from './image-gallery.component';

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

/** Estado que el catálogo pasa al abrir el detalle, para restaurar sus filtros al volver. */
export interface DetailNavigationState {
  catalogQueryParams?: Params;
}

const MAX_DESCRIPTION = 160;

/** Descripción para buscadores: nombre y precio primero, para que el recorte no los quite, y luego el texto. */
export function cardDescription(card: CardDetail): string {
  const base = card.description3d?.trim() || `Categoría: ${categoryLabels(card.categories).toLowerCase()}.`;
  const text = `${card.name}, tarjeta pop-up 3D a ${formatSoles(card.price)} en Hora Azul. ${base}`;
  if (text.length <= MAX_DESCRIPTION) {
    return text;
  }
  const cut = text.slice(0, MAX_DESCRIPTION - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Datos estructurados schema.org de la tarjeta, para que Google muestre precio e imagen. */
export function productStructuredData(card: CardDetail): object {
  const url = absoluteUrl(`/tarjeta/${card.id}`);
  const images = [...card.images].sort((a, b) => a.sortOrder - b.sortOrder).map((image) => absoluteUrl(image.url));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: card.name,
    description: card.description3d ?? cardDescription(card),
    sku: String(card.catalogNumber),
    url,
    ...(images.length > 0 ? { image: images } : {}),
    brand: { '@type': 'Brand', name: 'Hora Azul' },
    category: categoryLabels(card.categories),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PEN',
      price: card.price.toFixed(2),
      availability: card.active ? 'https://schema.org/InStock' : 'https://schema.org/Discontinued',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

/** Ficha completa de una tarjeta con galería y botón para agregarla al carrito. */
@Component({
  selector: 'app-product-detail-page',
  imports: [ImageGalleryComponent, RouterLink, SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-hora-azul-700 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-hora-azul-600"
      (click)="backToCatalog()"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      Volver al catálogo
    </button>

    @switch (status()) {
      @case ('ready') {
        @if (card(); as card) {
          <article class="grid gap-8 lg:grid-cols-2 lg:gap-12" aria-labelledby="card-title">
            <app-image-gallery [images]="card.images" [cardName]="card.name" />

            <div class="flex flex-col">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-hora-azul-700">
                {{ categoryLabel() }} · Nº {{ card.catalogNumber }}
              </p>
              <h1 id="card-title" class="mt-2 font-display text-3xl uppercase leading-tight text-hora-azul-900 sm:text-4xl">
                {{ card.name }}
              </h1>
              <p class="mt-4 inline-flex w-fit rounded-lg bg-hora-azul-500 px-4 py-1.5 text-2xl font-bold text-hora-azul-900">
                {{ card.price | soles }}
              </p>

              @if (card.description3d) {
                <p class="mt-6 font-light leading-relaxed text-slate-700">{{ card.description3d }}</p>
              }

              <dl class="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-hora-azul-50 p-4 text-sm">
                <div>
                  <dt class="font-semibold text-hora-azul-900">Dimensiones</dt>
                  <dd class="mt-0.5 text-slate-700">{{ card.dimensions ?? 'No especificadas' }}</dd>
                </div>
                <div>
                  <dt class="font-semibold text-hora-azul-900">Sobre</dt>
                  <dd class="mt-0.5 text-slate-700">{{ card.envelopeIncluded ? 'Incluye sobre' : 'No incluye sobre' }}</dd>
                </div>
              </dl>

              <div class="mt-8">
                @if (card.active) {
                  <button
                    type="button"
                    class="w-full rounded-xl bg-hora-azul-700 px-6 py-3.5 text-lg font-semibold text-white shadow-sm hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 sm:w-auto"
                    (click)="addToCart(card)"
                  >
                    Agregar al carrito
                  </button>
                } @else {
                  <button
                    type="button"
                    disabled
                    class="w-full cursor-not-allowed rounded-xl bg-slate-200 px-6 py-3.5 text-lg font-semibold text-slate-600 sm:w-auto"
                    aria-describedby="card-unavailable"
                  >
                    Agregar al carrito
                  </button>
                  <p id="card-unavailable" class="mt-2 text-sm font-medium text-red-800">
                    Esta tarjeta no está disponible por el momento.
                  </p>
                }
                <p class="mt-3 min-h-5 text-sm font-medium" [class.text-red-800]="cartMessageIsError()" [class.text-hora-azul-800]="!cartMessageIsError()" role="status">
                  {{ cartMessage() }}
                </p>
              </div>
            </div>
          </article>
        }
      }
      @case ('not-found') {
        <div class="mx-auto max-w-lg rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200">
          <p class="font-display text-5xl text-hora-azul-700">404</p>
          <h1 class="mt-2 text-xl font-semibold text-hora-azul-900">No encontramos esta tarjeta</h1>
          <p class="mt-2 text-slate-700">Es posible que el enlace esté mal escrito o que la tarjeta ya no exista.</p>
          <a
            routerLink="/"
            class="mt-6 inline-block rounded-lg bg-hora-azul-700 px-5 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
          >
            Ver el catálogo
          </a>
        </div>
      }
      @case ('error') {
        <div class="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
          <p class="font-medium text-red-900">No pudimos cargar esta tarjeta.</p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-hora-azul-700 px-5 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
            (click)="load()"
          >
            Reintentar
          </button>
        </div>
      }
      @default {
        <div class="grid animate-pulse gap-8 lg:grid-cols-2 lg:gap-12" aria-busy="true" aria-label="Cargando tarjeta">
          <div class="aspect-[4/3] rounded-2xl bg-slate-200"></div>
          <div class="space-y-4">
            <div class="h-4 w-1/3 rounded bg-slate-200"></div>
            <div class="h-9 w-3/4 rounded bg-slate-200"></div>
            <div class="h-9 w-28 rounded bg-slate-200"></div>
            <div class="h-24 rounded bg-slate-200"></div>
          </div>
        </div>
      }
    }
  `,
})
export default class ProductDetailPageComponent {
  private readonly cardService = inject(CardService);
  private readonly cart = inject(CartService);
  private readonly drawer = inject(CartDrawerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  /** Filtros del catálogo de origen; {@code undefined} si se llegó por URL directa. */
  private readonly catalogQueryParams = (inject(Location).getState() as DetailNavigationState | null)
    ?.catalogQueryParams;

  protected readonly status = signal<LoadStatus>('loading');
  protected readonly card = signal<CardDetail | null>(null);
  protected readonly cartMessage = signal('');
  protected readonly cartMessageIsError = signal(false);
  protected readonly categoryLabel = computed(() => {
    const card = this.card();
    return card ? categoryLabels(card.categories) : '';
  });

  constructor() {
    // El JSON-LD vive en <head>: hay que quitarlo al salir de la ficha
    this.destroyRef.onDestroy(() => this.seo.setStructuredData(null));
    this.load();
  }

  protected load(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.status.set('loading');
    this.cardService
      .getCardById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (card) => {
          this.card.set(card);
          this.status.set('ready');
          this.seo.setPage({
            title: `${card.name} — Hora Azul`,
            description: cardDescription(card),
            path: `/tarjeta/${card.id}`,
            image: card.coverImageUrl,
            // Una tarjeta inactiva no se puede comprar: no debe aparecer en los buscadores
            noindex: !card.active,
          });
          this.seo.setStructuredData(card.active ? productStructuredData(card) : null);
        },
        error: (error: unknown) => {
          // Un id que no es UUID hace que el backend responda 404 (ruta) o 400
          const notFound =
            error instanceof HttpErrorResponse && (error.status === 404 || error.status === 400);
          this.status.set(notFound ? 'not-found' : 'error');
          if (notFound) {
            this.seo.setPage({
              title: 'Tarjeta no encontrada — Hora Azul',
              description: 'Esta tarjeta no existe en el catálogo de Hora Azul.',
              path: `/tarjeta/${id}`,
              noindex: true,
            });
          }
        },
      });
  }

  protected addToCart(card: CardDetail): void {
    if (this.cart.addItem(card)) {
      this.cartMessageIsError.set(false);
      this.cartMessage.set('Tarjeta agregada al carrito.');
      this.drawer.show();
    } else {
      this.cartMessageIsError.set(true);
      this.cartMessage.set('Ya tienes el máximo de 99 unidades de esta tarjeta en el carrito.');
    }
  }

  /** Vuelve al catálogo con los filtros de origen, o al catálogo limpio si se llegó por URL. */
  protected backToCatalog(): void {
    this.router.navigate(['/'], { queryParams: this.catalogQueryParams ?? {} });
  }
}
