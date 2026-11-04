import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { App } from './app';
import { SILENT_HTTP_ERRORS } from './core/http-error.interceptor';

@Component({ template: '' })
class EmptyPage {}

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: EmptyPage },
          { path: 'admin/ordenes', component: EmptyPage },
          { path: 'administracion', component: EmptyPage },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renderiza el navbar y el contenido principal', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/q/health`).flush({ status: 'UP' });

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-navbar')).not.toBeNull();
    expect(element.querySelector('main#contenido router-outlet')).not.toBeNull();
  });

  it('envía el keep-alive a /q/health de forma silenciosa e ignora sus errores', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const req = http.expectOne(`${environment.apiUrl}/q/health`);
    expect(req.request.context.get(SILENT_HTTP_ERRORS)).toBe(true);
    expect(() => req.error(new ProgressEvent('error'))).not.toThrow();
  });

  it('oculta barra, pie y carrito en el panel y los recupera al volver a la tienda', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/q/health`).flush({ status: 'UP' });
    const element: HTMLElement = fixture.nativeElement;
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/admin/ordenes');
    await fixture.whenStable();
    for (const selector of ['app-navbar', 'app-footer', 'app-cart-drawer', 'main#contenido']) {
      expect(element.querySelector(selector)).toBeNull();
    }
    expect(element.querySelector('router-outlet')).not.toBeNull();

    await router.navigateByUrl('/');
    await fixture.whenStable();
    expect(element.querySelector('app-navbar')).not.toBeNull();
    expect(element.querySelector('app-cart-drawer')).not.toBeNull();
  });

  it('solo trata como panel las rutas bajo /admin', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/q/health`).flush({ status: 'UP' });

    await TestBed.inject(Router).navigateByUrl('/administracion');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-navbar')).not.toBeNull();
  });
});
