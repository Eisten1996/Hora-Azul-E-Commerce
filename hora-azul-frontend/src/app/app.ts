import { HttpClient, HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { CartDrawerComponent } from './cart/cart-drawer.component';
import { CartService } from './core/cart.service';
import { SILENT_HTTP_ERRORS } from './core/http-error.interceptor';
import { NavbarComponent } from './layout/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  constructor() {
    // Instanciar el carrito al arrancar para que restaure su estado desde localStorage
    inject(CartService);
  }

  /** Despierta el backend de la capa gratuita antes de que el cliente lo necesite. */
  ngOnInit(): void {
    this.http
      .get(`${environment.apiUrl}/q/health`, {
        context: new HttpContext().set(SILENT_HTTP_ERRORS, true),
      })
      .subscribe({ error: () => undefined });
  }
}
