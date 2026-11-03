import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SolesPipe, formatSoles } from '../core/money';
import { CARD_CATEGORY_LABELS, CardSummary, categoryLabels } from '../models';

/** Tarjeta individual del catálogo: portada, nombre, categoría y precio. */
@Component({
  selector: 'app-card-item',
  imports: [SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
      [attr.aria-label]="ariaLabel()"
      (click)="cardClick.emit(card())"
    >
      <div class="aspect-[3/2] w-full overflow-hidden bg-hora-azul-50">
        @if (card().coverImageUrl; as url) {
          <img
            [src]="url"
            [alt]="altText()"
            width="600"
            height="400"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        } @else {
          <div class="flex h-full items-center justify-center text-sm text-hora-azul-800" role="img" [attr.aria-label]="altText()">
            Sin imagen
          </div>
        }
      </div>
      <!-- Franja de precio en cian, como en el catálogo (texto marino para cumplir contraste AA) -->
      <p class="bg-hora-azul-500 px-3 py-1.5 text-center text-sm font-bold text-hora-azul-900 sm:text-base">
        {{ card().price | soles }}
      </p>
      <div class="flex flex-1 flex-col items-start gap-2 p-3 sm:p-4">
        <h3 class="line-clamp-2 text-sm font-bold uppercase leading-snug text-hora-azul-900 sm:text-[0.95rem]">
          {{ card().name }}
        </h3>
        <ul class="mt-auto flex flex-wrap gap-1.5" aria-hidden="true">
          @for (category of card().categories; track category) {
            <li class="rounded-full bg-hora-azul-100 px-2.5 py-0.5 text-xs font-medium text-hora-azul-900">
              {{ labels[category] }}
            </li>
          }
        </ul>
      </div>
    </button>
  `,
})
export class CardItemComponent {
  readonly card = input.required<CardSummary>();
  readonly cardClick = output<CardSummary>();

  protected readonly labels = CARD_CATEGORY_LABELS;
  protected readonly categoryLabel = computed(() => categoryLabels(this.card().categories));
  protected readonly altText = computed(
    () => `Tarjeta pop-up 3D "${this.card().name}", ${this.categoryLabel()}`,
  );
  protected readonly ariaLabel = computed(
    () => `${this.card().name}, ${this.categoryLabel()}, ${formatSoles(this.card().price)}. Ver detalle`,
  );
}
