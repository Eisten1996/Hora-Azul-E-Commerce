import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService } from '../core/card.service';
import type { DetailNavigationState } from '../detail/product-detail-page.component';
import { CardSummary } from '../models';
import { CardGridComponent } from './card-grid.component';
import {
  CatalogFilters,
  filterCards,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
} from './catalog-filter';
import { FilterPanelComponent } from './filter-panel.component';

type LoadStatus = 'loading' | 'error' | 'ready';

/**
 * Página principal: carga el catálogo, aplica los filtros en el navegador y
 * guarda los filtros en los query params para conservarlos al volver del detalle.
 */
@Component({
  selector: 'app-catalog-page',
  imports: [CardGridComponent, FilterPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="catalog-title">
      <div class="relative mb-8 overflow-hidden rounded-2xl bg-white px-6 py-8 shadow-sm ring-1 ring-slate-200 sm:px-10 lg:mb-10">
        <!-- Franjas diagonales de la portada del catálogo -->
        <div class="pointer-events-none absolute -right-14 -top-6 hidden w-56 rotate-[35deg] sm:block" aria-hidden="true">
          <div class="h-4 bg-hora-azul-900"></div>
          <div class="h-4 bg-hora-azul-700"></div>
          <div class="h-4 bg-hora-azul-500"></div>
          <div class="h-4 bg-hora-azul-100"></div>
        </div>
        <div class="relative flex items-center gap-8">
          <div class="flex-1">
            <p class="text-sm font-semibold uppercase tracking-[0.25em] text-hora-azul-700">Catálogo 2026</p>
            <h1 id="catalog-title" class="mt-2 font-display text-3xl uppercase leading-tight text-hora-azul-900 sm:text-4xl">
              Tarjetas de felicitaciones 3D
            </h1>
            <p class="mt-3 max-w-xl font-light text-slate-700">
              Diseños pop-up artesanales con corte láser para cumpleaños, amor, flores y cada ocasión especial.
            </p>
          </div>
          <img
            src="brand/hora-azul-logo.webp"
            alt="Logo de Hora Azul: calle con faroles bajo un cielo al atardecer"
            width="421"
            height="383"
            class="mr-14 mt-6 hidden w-44 shrink-0 md:block lg:mr-20 lg:w-52"
          />
        </div>
      </div>

      <div class="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside class="mb-6 lg:mb-0">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-900 lg:hidden"
            [attr.aria-expanded]="filtersOpen()"
            aria-controls="catalog-filters"
            (click)="filtersOpen.set(!filtersOpen())"
          >
            Filtros{{ activeFilterCount() > 0 ? ' (' + activeFilterCount() + ')' : '' }}
            <svg class="h-5 w-5 transition" [class.rotate-180]="filtersOpen()" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <div
            id="catalog-filters"
            class="mt-3 rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:mt-0 lg:block"
            [class.hidden]="!filtersOpen()"
          >
            <app-filter-panel [filters]="filters()" (filtersChange)="applyFilters($event)" />
          </div>
        </aside>

        <div>
          @switch (status()) {
            @case ('error') {
              <div class="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
                <p class="font-medium text-red-900">No pudimos cargar el catálogo.</p>
                <p class="mt-1 text-sm text-red-800">Revisa tu conexión e inténtalo de nuevo.</p>
                <button
                  type="button"
                  class="mt-4 rounded-lg bg-hora-azul-700 px-5 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
                  (click)="load()"
                >
                  Reintentar
                </button>
              </div>
            }
            @case ('ready') {
              @if (cards().length === 0) {
                <p class="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600">
                  No hay tarjetas disponibles por el momento.
                </p>
              } @else if (visibleCards().length === 0) {
                <p class="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600" role="status">
                  No se encontraron tarjetas con ese criterio de búsqueda.
                </p>
              } @else {
                <p class="mb-4 text-sm text-slate-600" role="status">
                  {{ visibleCards().length }} de {{ cards().length }} tarjetas
                </p>
                <app-card-grid [cards]="visibleCards()" (cardClick)="openDetail($event)" />
              }
            }
            @default {
              <app-card-grid [loading]="true" />
            }
          }
        </div>
      </div>
    </section>
  `,
})
export default class CatalogPageComponent {
  private readonly cardService = inject(CardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly status = signal<LoadStatus>('loading');
  protected readonly cards = signal<CardSummary[]>([]);
  protected readonly filtersOpen = signal(false);

  /**
   * Fuente de verdad de los filtros. Se inicializa desde la URL (al volver del detalle
   * la página se recrea) y se actualiza al instante en cada cambio; la URL solo se
   * sincroniza. Leer los filtros de la URL provocaba que dos cambios rápidos se
   * pisaran mientras la primera navegación seguía en curso.
   */
  protected readonly filters = signal<CatalogFilters>(
    filtersFromParams(this.route.snapshot.queryParams),
  );
  protected readonly visibleCards = computed(() => filterCards(this.cards(), this.filters()));
  protected readonly activeFilterCount = computed(() => {
    const filters = this.filters();
    return filters.categories.length + (filters.priceRange ? 1 : 0) + (filters.search.trim() ? 1 : 0);
  });

  constructor() {
    this.load();
    // En móvil, si se llega con filtros en la URL, mostrar el panel abierto
    this.filtersOpen.set(hasActiveFilters(this.filters()));
  }

  protected load(): void {
    this.status.set('loading');
    this.cardService
      .getCards()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cards) => {
          this.cards.set(cards);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  protected applyFilters(filters: CatalogFilters): void {
    this.filters.set(filters);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToParams(filters),
      replaceUrl: true,
    });
  }

  protected openDetail(card: CardSummary): void {
    const state: DetailNavigationState = { catalogQueryParams: filtersToParams(this.filters()) };
    this.router.navigate(['/tarjeta', card.id], { state });
  }
}
