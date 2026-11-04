import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { normalizeText } from '../../catalog/catalog-filter';
import { thumbnailUrl } from '../../core/card-photos';
import { SolesPipe } from '../../core/money';
import { categoryLabels } from '../../models';
import { AdminCard, AdminCardService } from '../core/admin-card.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

export type CardStatusFilter = 'all' | 'active' | 'inactive';

/** Tarjetas que cumplen el filtro de estado y contienen el texto en el nombre o el número. */
export function filterAdminCards(cards: AdminCard[], status: CardStatusFilter, search: string): AdminCard[] {
  const text = normalizeText(search.trim());
  return cards.filter(
    (card) =>
      (status === 'all' || card.active === (status === 'active')) &&
      (!text || normalizeText(card.name).includes(text) || String(card.catalogNumber).includes(text)),
  );
}

/** Listado de todas las tarjetas del catálogo, activas e inactivas. */
@Component({
  selector: 'app-admin-cards-page',
  imports: [ConfirmDialogComponent, RouterLink, SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-3xl uppercase text-hora-azul-900">Tarjetas</h1>
      <a
        routerLink="/admin/tarjetas/nueva"
        class="rounded-lg bg-hora-azul-700 px-4 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
      >
        Nueva tarjeta
      </a>
    </div>

    <p class="mt-4 rounded-lg border border-hora-azul-200 bg-hora-azul-50 px-4 py-3 text-sm text-hora-azul-900 empty:hidden" role="status">{{ notice() }}</p>

    @switch (status()) {
      @case ('loading') {
        <p class="mt-6 text-slate-700" role="status" aria-busy="true">Cargando tarjetas… Si el servidor estaba en reposo, puede tardar hasta un minuto.</p>
      }
      @case ('error') {
        <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
          <p class="font-medium text-red-900">No pudimos cargar las tarjetas.</p>
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
        <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="sm:w-48">
            <label for="filtro-estado" class="block text-sm font-semibold text-slate-900">Estado</label>
            <select
              id="filtro-estado"
              class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900"
              [value]="statusFilter()"
              (change)="statusFilter.set($any($event.target).value)"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
          <div class="sm:w-80">
            <label for="filtro-texto" class="block text-sm font-semibold text-slate-900">Buscar por nombre o número</label>
            <input
              id="filtro-texto"
              type="search"
              class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900"
              [value]="search()"
              (input)="search.set($any($event.target).value)"
            />
          </div>
          <p class="text-sm text-slate-700 sm:ml-auto sm:pb-3" role="status">{{ visibleCards().length }} de {{ cards().length }} tarjetas</p>
        </div>

        @if (actionError()) {
          <p class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{{ actionError() }}</p>
        }

        @if (visibleCards().length === 0) {
          <p class="mt-6 rounded-xl bg-white px-6 py-10 text-center text-slate-700 ring-1 ring-slate-200">
            {{ cards().length === 0 ? 'Todavía no hay tarjetas.' : 'Ninguna tarjeta coincide con la búsqueda.' }}
          </p>
        } @else {
          <ul class="mt-6 divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200">
            @for (card of visibleCards(); track card.id) {
              <li class="flex flex-wrap items-center gap-x-4 gap-y-3 p-4" [attr.data-testid]="'card-' + card.catalogNumber">
                <div class="h-[72px] w-24 shrink-0 overflow-hidden rounded-lg bg-hora-azul-50">
                  @if (card.coverImageUrl; as url) {
                    <img [src]="thumbnail(url)" alt="" width="96" height="72" loading="lazy" class="h-full w-full object-cover" />
                  }
                </div>
                <div class="min-w-0 flex-1 basis-40">
                  <p class="text-sm text-slate-700">Nº {{ card.catalogNumber }}</p>
                  <p class="font-semibold break-words text-hora-azul-900">{{ card.name }}</p>
                  <p class="text-sm text-slate-700">{{ labels(card) }}</p>
                </div>
                <p class="font-semibold text-slate-900">{{ card.price | soles }}</p>
                <span
                  class="rounded-full px-2.5 py-1 text-sm font-medium"
                  [class]="card.active ? 'bg-hora-azul-100 text-hora-azul-900' : 'bg-slate-200 text-slate-800'"
                >
                  {{ card.active ? 'Activa' : 'Inactiva' }}
                </span>
                <div class="flex gap-2">
                  <a
                    [routerLink]="['/admin/tarjetas', card.id]"
                    [attr.aria-label]="'Editar ' + card.name"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
                  >
                    Editar
                  </a>
                  <button
                    type="button"
                    [attr.aria-label]="(card.active ? 'Desactivar ' : 'Activar ') + card.name"
                    [disabled]="busyId() === card.id"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-wait disabled:opacity-70"
                    (click)="pending.set(card)"
                  >
                    {{ card.active ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </li>
            }
          </ul>
        }
      }
    }

    <app-confirm-dialog
      [open]="pending() !== null"
      [heading]="dialogHeading()"
      [message]="dialogMessage()"
      [confirmLabel]="pending()?.active ? 'Desactivar' : 'Activar'"
      [danger]="pending()?.active ?? false"
      (confirmed)="applyPending()"
      (cancelled)="pending.set(null)"
    />
  `,
})
export default class AdminCardsPageComponent {
  private readonly service = inject(AdminCardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly cards = signal<AdminCard[]>([]);
  protected readonly statusFilter = signal<CardStatusFilter>('all');
  protected readonly search = signal('');
  protected readonly notice = signal(this.service.takeNotice());
  protected readonly actionError = signal('');
  protected readonly pending = signal<AdminCard | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected readonly visibleCards = computed(() =>
    filterAdminCards(this.cards(), this.statusFilter(), this.search()),
  );
  protected readonly dialogHeading = computed(() => {
    const card = this.pending();
    return card ? `¿${card.active ? 'Desactivar' : 'Activar'} "${card.name}"?` : '';
  });
  protected readonly dialogMessage = computed(() =>
    this.pending()?.active
      ? 'Dejará de verse en la tienda y no se podrá comprar. Las órdenes ya registradas no cambian.'
      : 'Volverá a verse en la tienda con todos sus datos.',
  );

  protected readonly thumbnail = thumbnailUrl;
  protected readonly labels = (card: AdminCard) => categoryLabels(card.categories);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.status.set('loading');
    this.service
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cards) => {
          this.cards.set(cards);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  protected applyPending(): void {
    const card = this.pending();
    if (!card) {
      return;
    }
    const active = !card.active;
    this.pending.set(null);
    this.notice.set('');
    this.actionError.set('');
    this.busyId.set(card.id);
    this.service
      .setActive(card.id, active)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.cards.update((cards) => cards.map((c) => (c.id === card.id ? { ...c, active } : c)));
          this.notice.set(`"${card.name}" ${active ? 'se activó y ya se ve en la tienda' : 'se desactivó y ya no se ve en la tienda'}.`);
        },
        error: () => {
          this.busyId.set(null);
          this.actionError.set(`No se pudo ${active ? 'activar' : 'desactivar'} "${card.name}". Inténtalo de nuevo.`);
        },
      });
  }
}
