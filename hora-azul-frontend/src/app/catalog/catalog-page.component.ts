import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CardService } from '../core/card.service';
import { CardSummary } from '../models';
import { CardGridComponent } from './card-grid.component';

type LoadStatus = 'loading' | 'error' | 'ready';

/** Página principal: carga el catálogo y muestra la cuadrícula o el estado correspondiente. */
@Component({
  selector: 'app-catalog-page',
  imports: [CardGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="catalog-title">
      <div class="mb-6 lg:mb-8">
        <h1 id="catalog-title" class="text-2xl font-bold tracking-tight text-hora-azul-950 sm:text-3xl">
          Tarjetas pop-up 3D
        </h1>
        <p class="mt-1 text-slate-600">Diseños artesanales con corte láser para cada ocasión.</p>
      </div>

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
          } @else {
            <app-card-grid [cards]="cards()" (cardClick)="openDetail($event)" />
          }
        }
        @default {
          <app-card-grid [loading]="true" />
        }
      }
    </section>
  `,
})
export default class CatalogPageComponent {
  private readonly cardService = inject(CardService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly status = signal<LoadStatus>('loading');
  protected readonly cards = signal<CardSummary[]>([]);

  constructor() {
    this.load();
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

  protected openDetail(card: CardSummary): void {
    this.router.navigate(['/tarjeta', card.id]);
  }
}
