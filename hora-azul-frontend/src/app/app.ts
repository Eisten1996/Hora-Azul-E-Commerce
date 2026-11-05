import { HttpClient, HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { environment } from '../environments/environment';
import { CartDrawerComponent } from './cart/cart-drawer.component';
import { CartService } from './core/cart.service';
import { SILENT_HTTP_ERRORS } from './core/http-error.interceptor';
import { FooterComponent } from './layout/footer.component';
import { NavbarComponent } from './layout/navbar.component';

/** El panel administrativo tiene su propia navegación, sin la barra ni el carrito de la tienda. */
function isAdminUrl(url: string): boolean {
  return /^\/admin([/?#]|$)/.test(url);
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CartDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly isAdmin = toSignal(
    inject(Router).events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => isAdminUrl(event.urlAfterRedirects)),
    ),
    { initialValue: isAdminUrl(location.pathname) },
  );

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
