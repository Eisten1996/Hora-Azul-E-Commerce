import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderItem, OrderStatus } from '../../models';
import { ADMIN_REQUEST } from './admin-auth.interceptor';

export const ORDERS_PAGE_SIZE = 20;

/** Fila del listado de órdenes. */
export interface AdminOrderSummary {
  orderCode: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

/** Respuesta de `GET /api/orders`. `page` empieza en 0. */
export interface AdminOrderPage {
  content: AdminOrderSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Respuesta de `GET /api/orders/{orderCode}`. */
export interface AdminOrderDetail extends AdminOrderSummary {
  customerPhone: string;
  deliveryAddress: string;
  estimatedDeliveryDate: string;
  items: OrderItem[];
}

/** Consulta y cambio de estado de las órdenes desde el panel. */
@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${environment.apiUrl}/api/orders`;
  private readonly context = new HttpContext().set(ADMIN_REQUEST, true);

  /** @param page página empezando en 0 */
  list(status: OrderStatus | null, page: number): Observable<AdminOrderPage> {
    let params = new HttpParams().set('page', page).set('size', ORDERS_PAGE_SIZE);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminOrderPage>(this.ordersUrl, { params, context: this.context });
  }

  get(orderCode: string): Observable<AdminOrderDetail> {
    return this.http.get<AdminOrderDetail>(`${this.ordersUrl}/${encodeURIComponent(orderCode)}`, {
      context: this.context,
    });
  }

  changeStatus(orderCode: string, status: OrderStatus): Observable<AdminOrderDetail> {
    return this.http.patch<AdminOrderDetail>(
      `${this.ordersUrl}/${encodeURIComponent(orderCode)}/status`,
      { status },
      { context: this.context },
    );
  }
}
