import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderRequest, OrderResponse } from '../models';

/** Error de creación de orden con un mensaje listo para mostrar al cliente. */
export class OrderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/orders`;

  /**
   * Registra la orden en el backend.
   *
   * @throws OrderError con un mensaje descriptivo en español si la petición falla
   */
  createOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http
      .post<OrderResponse>(this.baseUrl, request)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => toOrderError(error))));
  }
}

function toOrderError(error: HttpErrorResponse): OrderError {
  const backendMessage: unknown = error.error?.message;

  switch (true) {
    case error.status === 0:
      return new OrderError(
        'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
        0,
      );
    case error.status === 404:
      return new OrderError(
        'Alguna de las tarjetas de tu carrito ya no está disponible. Revisa el carrito e inténtalo de nuevo.',
        404,
      );
    case error.status === 400 || error.status === 422:
      return new OrderError(
        typeof backendMessage === 'string' && backendMessage
          ? `Revisa los datos del pedido: ${backendMessage}`
          : 'Revisa los datos del pedido e inténtalo de nuevo.',
        error.status,
      );
    default:
      return new OrderError(
        'Ocurrió un error al registrar tu pedido. Inténtalo de nuevo en unos minutos.',
        error.status,
      );
  }
}
