import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { CARD_CATEGORY_LABELS, CardCategory } from '../models';
import { CatalogFilters, EMPTY_FILTERS, PRICE_RANGES, PriceRange, hasActiveFilters } from './catalog-filter';

/**
 * Controles de filtrado del catálogo. Es un componente controlado: muestra los
 * filtros recibidos y emite {@code filtersChange} con el objeto completo actualizado.
 */
@Component({
  selector: 'app-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="space-y-6" role="search" aria-label="Filtrar tarjetas" (submit)="$event.preventDefault()">
      <div>
        <label for="catalog-search" class="mb-1.5 block text-sm font-semibold text-slate-900">Buscar</label>
        <input
          id="catalog-search"
          type="search"
          autocomplete="off"
          placeholder="Ej. rosa, globos…"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-hora-azul-600 focus:outline-2 focus:outline-hora-azul-600/30"
          [value]="filters().search"
          (input)="setSearch($any($event.target).value)"
        />
      </div>

      <fieldset>
        <legend class="mb-2 text-sm font-semibold text-slate-900">Categoría</legend>
        <div class="space-y-1">
          @for (category of categories; track category.value) {
            <label class="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-slate-700 hover:bg-hora-azul-50">
              <input
                type="checkbox"
                class="h-4 w-4 accent-hora-azul-700"
                [checked]="filters().categories.includes(category.value)"
                (change)="toggleCategory(category.value)"
              />
              {{ category.label }}
            </label>
          }
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-sm font-semibold text-slate-900">Precio</legend>
        <div class="space-y-1">
          <label class="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-slate-700 hover:bg-hora-azul-50">
            <input
              type="radio"
              name="catalog-price"
              class="h-4 w-4 accent-hora-azul-700"
              [checked]="filters().priceRange === null"
              (change)="setPriceRange(null)"
            />
            Todos los precios
          </label>
          @for (range of priceRanges; track range.value) {
            <label class="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-slate-700 hover:bg-hora-azul-50">
              <input
                type="radio"
                name="catalog-price"
                class="h-4 w-4 accent-hora-azul-700"
                [checked]="filters().priceRange === range.value"
                (change)="setPriceRange(range.value)"
              />
              {{ range.label }}
            </label>
          }
        </div>
      </fieldset>

      <button
        type="button"
        class="w-full rounded-lg border border-hora-azul-700 px-4 py-2 font-medium text-hora-azul-800 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-500 disabled:hover:bg-transparent"
        [disabled]="!active()"
        (click)="clear()"
      >
        Limpiar filtros
      </button>
    </form>
  `,
})
export class FilterPanelComponent {
  readonly filters = input<CatalogFilters>(EMPTY_FILTERS);
  readonly filtersChange = output<CatalogFilters>();

  /**
   * Últimos filtros conocidos: sigue al input, pero se actualiza al emitir para que dos
   * cambios dentro del mismo frame (antes de que el padre vuelva a pasar el input)
   * se combinen en lugar de pisarse.
   */
  private readonly current = linkedSignal(() => this.filters());

  protected readonly active = computed(() => hasActiveFilters(this.filters()));
  protected readonly categories = (Object.keys(CARD_CATEGORY_LABELS) as CardCategory[]).map((value) => ({
    value,
    label: CARD_CATEGORY_LABELS[value],
  }));
  protected readonly priceRanges = (Object.keys(PRICE_RANGES) as PriceRange[]).map((value) => ({
    value,
    label: PRICE_RANGES[value].label,
  }));

  protected setSearch(search: string): void {
    this.update({ search });
  }

  protected toggleCategory(category: CardCategory): void {
    const current = this.current().categories;
    const categories = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    this.update({ categories });
  }

  protected setPriceRange(priceRange: PriceRange | null): void {
    this.update({ priceRange });
  }

  protected clear(): void {
    this.current.set(EMPTY_FILTERS);
    this.filtersChange.emit(EMPTY_FILTERS);
  }

  private update(change: Partial<CatalogFilters>): void {
    const next = { ...this.current(), ...change };
    this.current.set(next);
    this.filtersChange.emit(next);
  }
}
