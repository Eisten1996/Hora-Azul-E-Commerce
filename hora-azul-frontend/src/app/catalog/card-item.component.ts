import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { photoSrcset } from '../core/card-photos';
import { SolesPipe } from '../core/money';
import { CARD_CATEGORY_LABELS, CardSummary, categoryLabels } from '../models';

/**
 * Tarjeta individual del catálogo: portada, precio, nombre y categorías.
 *
 * <p>Toda la tarjeta es clicable, pero el control accesible es el botón del título:
 * su nombre es el nombre visible de la tarjeta y un pseudo-elemento lo extiende
 * sobre toda la tarjeta.</p>
 */
@Component({
  selector: 'app-card-item',
  imports: [SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-hora-azul-600"
    >
      <div class="aspect-[3/2] w-full overflow-hidden bg-hora-azul-50">
        @if (card().coverImageUrl; as url) {
          <img
            [src]="url"
            [attr.srcset]="srcset()"
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
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
        <h2 class="line-clamp-2 text-sm font-bold uppercase leading-snug text-hora-azul-900 sm:text-[0.95rem]">
          <button
            type="button"
            class="text-left uppercase outline-none after:absolute after:inset-0 after:content-['']"
            (click)="cardClick.emit(card())"
          >
            {{ card().name }}
          </button>
        </h2>
        <ul class="mt-auto flex flex-wrap gap-1.5" aria-label="Categorías">
          @for (category of card().categories; track category) {
            <li class="rounded-full bg-hora-azul-100 px-2.5 py-0.5 text-xs font-medium text-hora-azul-900">
              {{ labels[category] }}
            </li>
          }
        </ul>
      </div>
    </article>
  `,
})
export class CardItemComponent {
  readonly card = input.required<CardSummary>();
  readonly cardClick = output<CardSummary>();

  protected readonly labels = CARD_CATEGORY_LABELS;
  protected readonly altText = computed(
    () => `Tarjeta pop-up 3D "${this.card().name}", ${categoryLabels(this.card().categories)}`,
  );
  protected readonly srcset = computed(() => {
    const url = this.card().coverImageUrl;
    return url ? photoSrcset(url) : null;
  });
}
