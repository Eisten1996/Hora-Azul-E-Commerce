import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CardSummary } from '../models';
import { CardItemComponent } from './card-item.component';

/** Cuadrícula responsiva de tarjetas: 2 columnas en móvil, 3 en tablet y 4 desde 1024px. */
@Component({
  selector: 'app-card-grid',
  imports: [CardItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <ul class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Cargando tarjetas">
        @for (skeleton of skeletons; track skeleton) {
          <li class="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white" data-testid="card-skeleton">
            <div class="aspect-[3/2] bg-slate-200"></div>
            <div class="space-y-2 p-3 sm:p-4">
              <div class="h-3 w-1/3 rounded bg-slate-200"></div>
              <div class="h-4 w-3/4 rounded bg-slate-200"></div>
              <div class="h-5 w-1/4 rounded bg-slate-200"></div>
            </div>
          </li>
        }
      </ul>
    } @else {
      <ul class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        @for (card of cards(); track card.id) {
          <li>
            <app-card-item [card]="card" (cardClick)="cardClick.emit($event)" />
          </li>
        }
      </ul>
    }
  `,
})
export class CardGridComponent {
  readonly cards = input<CardSummary[]>([]);
  readonly loading = input(false);
  readonly cardClick = output<CardSummary>();

  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);
}
