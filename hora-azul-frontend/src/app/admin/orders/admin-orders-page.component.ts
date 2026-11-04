import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { SolesPipe } from '../../core/money';
import { OrderStatus } from '../../models';
import { AdminOrderPage, AdminOrderService } from '../core/admin-order.service';
import { OrderStatusBadgeComponent } from '../shared/order-status-badge.component';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, formatOrderDateTime } from '../shared/order-status';

export interface OrdersQuery {
  status: OrderStatus | null;
  /** Página tal como se ve en la URL, empezando en 1. */
  page: number;
}

/** Lee el filtro y la página de la URL. Un valor manipulado se ignora en lugar de provocar un error. */
export function ordersQueryFromParams(params: ParamMap): OrdersQuery {
  const status = params.get('estado') as OrderStatus | null;
  const page = Number(params.get('pagina'));
  return {
    status: status && ORDER_STATUSES.includes(status) ? status : null,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

type ListState = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; orders: AdminOrderPage };

/** Listado de órdenes, de la más reciente a la más antigua. */
@Component({
  selector: 'app-admin-orders-page',
  imports: [OrderStatusBadgeComponent, RouterLink, SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-3xl uppercase text-hora-azul-900">Órdenes</h1>

    <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
      <div class="sm:w-64">
        <label for="filtro-estado" class="block text-sm font-semibold text-slate-900">Estado</label>
        <select
          id="filtro-estado"
          class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900"
          (change)="filterBy($any($event.target).value)"
        >
          <option value="" [selected]="query().status === null">Todas</option>
          @for (status of statuses; track status) {
            <option [value]="status" [selected]="query().status === status">{{ statusLabels[status] }}</option>
          }
        </select>
      </div>
      @if (ordersPage(); as orders) {
        <p class="text-sm text-slate-700 sm:ml-auto sm:pb-3" role="status">
          {{ orders.totalElements }} {{ orders.totalElements === 1 ? 'orden' : 'órdenes' }}
        </p>
      }
    </div>

    @switch (state().kind) {
      @case ('loading') {
        <p class="mt-6 text-slate-700" role="status" aria-busy="true">Cargando órdenes… Si el servidor estaba en reposo, puede tardar hasta un minuto.</p>
      }
      @case ('error') {
        <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
          <p class="font-medium text-red-900">No pudimos cargar las órdenes.</p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-hora-azul-700 px-5 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
            (click)="reload.next()"
          >
            Reintentar
          </button>
        </div>
      }
      @default {
        @if (ordersPage(); as orders) {
          @if (orders.content.length === 0) {
            <div class="mt-6 rounded-xl bg-white px-6 py-10 text-center text-slate-700 ring-1 ring-slate-200">
              @if (orders.totalElements > 0) {
                <p>Esta página ya no tiene órdenes.</p>
                <a routerLink="." [queryParams]="pageParams(1)" queryParamsHandling="merge" class="mt-2 inline-block font-medium text-hora-azul-800 underline">
                  Ir a la primera página
                </a>
              } @else if (query().status) {
                <p>No hay órdenes en este estado.</p>
              } @else {
                <p>Todavía no hay órdenes.</p>
              }
            </div>
          } @else {
            <!-- Escritorio: tabla -->
            <div class="mt-6 hidden overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 md:block">
              <table class="w-full text-left">
                <caption class="sr-only">Órdenes, de la más reciente a la más antigua</caption>
                <thead class="bg-hora-azul-50 text-sm text-hora-azul-900">
                  <tr>
                    <th scope="col" class="px-4 py-3 font-semibold">Código</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Fecha</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Cliente</th>
                    <th scope="col" class="px-4 py-3 text-right font-semibold">Total</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  @for (order of orders.content; track order.orderCode) {
                    <tr [attr.data-testid]="'row-' + order.orderCode">
                      <td class="px-4 py-3 whitespace-nowrap">
                        <a
                          [routerLink]="['/admin/ordenes', order.orderCode]"
                          queryParamsHandling="preserve"
                          class="font-medium text-hora-azul-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
                        >
                          {{ order.orderCode }}
                        </a>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ dateTime(order.createdAt) }}</td>
                      <td class="px-4 py-3 break-words text-slate-900">{{ order.customerName }}</td>
                      <td class="px-4 py-3 text-right font-semibold whitespace-nowrap text-slate-900">{{ order.totalAmount | soles }}</td>
                      <td class="px-4 py-3"><app-order-status-badge [status]="order.status" /></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Móvil: tarjetas -->
            <ul class="mt-6 divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200 md:hidden">
              @for (order of orders.content; track order.orderCode) {
                <li class="p-4" [attr.data-testid]="'item-' + order.orderCode">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <a
                      [routerLink]="['/admin/ordenes', order.orderCode]"
                      queryParamsHandling="preserve"
                      class="font-medium text-hora-azul-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
                    >
                      {{ order.orderCode }}
                    </a>
                    <app-order-status-badge [status]="order.status" />
                  </div>
                  <p class="mt-2 break-words text-slate-900">{{ order.customerName }}</p>
                  <div class="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span class="text-slate-700">{{ dateTime(order.createdAt) }}</span>
                    <span class="text-base font-semibold text-slate-900">{{ order.totalAmount | soles }}</span>
                  </div>
                </li>
              }
            </ul>
          }

          @if (orders.totalPages > 1 && orders.content.length > 0) {
            <nav class="mt-6 flex items-center justify-between gap-4" aria-label="Paginación de órdenes">
              <span class="min-w-24">
                @if (query().page > 1) {
                  <a [routerLink]="[]" [queryParams]="pageParams(query().page - 1)" queryParamsHandling="merge" rel="prev" [class]="pageLinkClass">Anterior</a>
                }
              </span>
              <span class="text-sm text-slate-700">Página {{ query().page }} de {{ orders.totalPages }}</span>
              <span class="min-w-24 text-right">
                @if (query().page < orders.totalPages) {
                  <a [routerLink]="[]" [queryParams]="pageParams(query().page + 1)" queryParamsHandling="merge" rel="next" [class]="pageLinkClass">Siguiente</a>
                }
              </span>
            </nav>
          }
        }
      }
    }
  `,
})
export default class AdminOrdersPageComponent {
  private readonly service = inject(AdminOrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly statuses = ORDER_STATUSES;
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly dateTime = formatOrderDateTime;
  protected readonly pageLinkClass =
    'inline-block rounded-lg px-3 py-2 text-sm font-medium text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600';

  protected readonly reload = new Subject<void>();
  protected readonly state = signal<ListState>({ kind: 'loading' });
  protected readonly query = toSignal(this.route.queryParamMap.pipe(map(ordersQueryFromParams)), {
    requireSync: true,
  });
  protected readonly ordersPage = computed(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.orders : null;
  });

  constructor() {
    // switchMap descarta la respuesta anterior si se cambia de filtro o de página mientras carga
    this.route.queryParamMap
      .pipe(
        map(ordersQueryFromParams),
        switchMap((query) =>
          this.reload.pipe(
            startWith(undefined),
            switchMap(() => {
              this.state.set({ kind: 'loading' });
              return this.service.list(query.status, query.page - 1).pipe(
                map((orders): ListState => ({ kind: 'ready', orders })),
                catchError(() => of<ListState>({ kind: 'error' })),
              );
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }

  protected filterBy(status: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado: status || null, pagina: null },
      queryParamsHandling: 'merge',
    });
  }

  protected pageParams(page: number): Params {
    return { pagina: page > 1 ? page : null };
  }
}
