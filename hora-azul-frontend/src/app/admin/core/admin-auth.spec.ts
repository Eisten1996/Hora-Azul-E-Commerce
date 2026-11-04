import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import fc from 'fast-check';
import { environment } from '../../../environments/environment';
import { adminAuthGuard, safeReturnUrl } from './admin-auth.guard';
import { ADMIN_REQUEST, adminAuthInterceptor, shouldAttachCredentials } from './admin-auth.interceptor';
import { AdminAuthService, basicAuthHeader } from './admin-auth.service';

const SESSION_URL = `${environment.apiUrl}/api/admin/session`;
const ORDERS_URL = `${environment.apiUrl}/api/orders`;

describe('autenticación del panel', () => {
  let http: HttpTestingController;
  let auth: AdminAuthService;

  function setup(): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([adminAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AdminAuthService);
  }

  function login(): void {
    auth.login('admin', 'secreto').subscribe();
    http.expectOne(SESSION_URL).flush({ username: 'admin' });
  }

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    setup();
  });

  afterEach(() => http.verify());

  describe('AdminAuthService', () => {
    it('inicia sesión con credenciales válidas y las guarda solo en sessionStorage', () => {
      auth.login('admin', 'secreto').subscribe();

      const req = http.expectOne(SESSION_URL);
      expect(req.request.headers.get('Authorization')).toBe(basicAuthHeader('admin', 'secreto'));
      expect(auth.isLoggedIn()).toBe(false);
      req.flush({ username: 'admin' });

      expect(auth.isLoggedIn()).toBe(true);
      expect(auth.username()).toBe('admin');
      expect(sessionStorage.length).toBe(1);
      expect(localStorage.length).toBe(0);
    });

    it('no inicia sesión si el backend rechaza las credenciales', () => {
      let status = 0;
      auth.login('admin', 'mala').subscribe({ error: (error) => (status = error.status) });
      http.expectOne(SESSION_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(status).toBe(401);
      expect(auth.isLoggedIn()).toBe(false);
      expect(sessionStorage.length).toBe(0);
    });

    it('conserva la sesión al recargar', () => {
      login();

      TestBed.resetTestingModule();
      setup();

      expect(auth.isLoggedIn()).toBe(true);
      expect(auth.authorization()).toBe(basicAuthHeader('admin', 'secreto'));
    });

    it('descarta una sesión guardada corrupta', () => {
      sessionStorage.setItem('hora_azul_admin', '{no es json');
      TestBed.resetTestingModule();
      setup();

      expect(auth.isLoggedIn()).toBe(false);
    });

    it('al cerrar sesión borra las credenciales', () => {
      login();
      auth.logout();

      expect(auth.isLoggedIn()).toBe(false);
      expect(sessionStorage.length).toBe(0);
    });

    it('Property 12: la cabecera conserva cualquier usuario y contraseña Unicode', () => {
      fc.assert(
        fc.property(
          fc.string({ unit: 'grapheme' }).filter((username) => !username.includes(':')),
          fc.string({ unit: 'grapheme' }),
          (username, password) => {
            const encoded = basicAuthHeader(username, password).replace('Basic ', '');
            const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
            expect(Buffer.from(bytes).toString('utf8')).toBe(`${username}:${password}`);
          },
        ),
      );
    });
  });

  describe('adminAuthInterceptor', () => {
    const adminContext = () => new HttpContext().set(ADMIN_REQUEST, true);

    it('Property 11: solo envía credenciales en peticiones marcadas a la API', () => {
      fc.assert(
        fc.property(fc.webUrl(), fc.boolean(), (url, isAdminRequest) => {
          const inApi = url.startsWith(`${environment.apiUrl}/api/`);
          expect(shouldAttachCredentials(url, isAdminRequest)).toBe(isAdminRequest && inApi);
        }),
      );
      expect(shouldAttachCredentials(ORDERS_URL, true)).toBe(true);
      expect(shouldAttachCredentials(ORDERS_URL, false)).toBe(false);
      expect(shouldAttachCredentials(`${environment.apiUrl}.evil.test/api/orders`, true)).toBe(false);
    });

    it('añade las credenciales a las peticiones del panel', () => {
      login();
      TestBed.inject(HttpClient).get(ORDERS_URL, { context: adminContext() }).subscribe();

      const req = http.expectOne(ORDERS_URL);
      expect(req.request.headers.get('Authorization')).toBe(basicAuthHeader('admin', 'secreto'));
      req.flush([]);
    });

    it('no añade credenciales a las peticiones de la tienda ni a otros dominios', () => {
      login();
      const client = TestBed.inject(HttpClient);
      client.get(`${environment.apiUrl}/api/cards`).subscribe();
      client.get('https://otro.example.com/api/x', { context: adminContext() }).subscribe();

      const store = http.expectOne(`${environment.apiUrl}/api/cards`);
      const other = http.expectOne('https://otro.example.com/api/x');
      expect(store.request.headers.has('Authorization')).toBe(false);
      expect(other.request.headers.has('Authorization')).toBe(false);
      store.flush({});
      other.flush({});
    });

    it('un 401 cierra la sesión y lleva al acceso avisando que expiró', () => {
      login();
      const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      TestBed.inject(HttpClient).get(ORDERS_URL, { context: adminContext() }).subscribe({ error: () => undefined });
      http.expectOne(ORDERS_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(auth.isLoggedIn()).toBe(false);
      expect(navigate).toHaveBeenCalledWith(
        ['/admin/login'],
        expect.objectContaining({ queryParams: expect.objectContaining({ sesion: 'expirada' }) }),
      );
    });

    it('otros errores no cierran la sesión', () => {
      login();
      TestBed.inject(HttpClient).get(ORDERS_URL, { context: adminContext() }).subscribe({ error: () => undefined });
      http.expectOne(ORDERS_URL).flush(null, { status: 500, statusText: 'Error' });

      expect(auth.isLoggedIn()).toBe(true);
    });
  });

  describe('adminAuthGuard', () => {
    const runGuard = () =>
      TestBed.runInInjectionContext(() =>
        adminAuthGuard({} as ActivatedRouteSnapshot, { url: '/admin/tarjetas' } as RouterStateSnapshot),
      );

    it('sin sesión redirige al acceso recordando la página', () => {
      const result = runGuard() as UrlTree;

      expect(result.toString()).toBe('/admin/login?returnUrl=%2Fadmin%2Ftarjetas');
    });

    it('con sesión deja pasar', () => {
      login();

      expect(runGuard()).toBe(true);
    });
  });

  describe('safeReturnUrl', () => {
    it('vuelve a páginas del panel', () => {
      expect(safeReturnUrl('/admin/tarjetas?estado=activas')).toBe('/admin/tarjetas?estado=activas');
    });

    it.each([null, '', '/', 'https://evil.test', '//evil.test', '/checkout', '/admin/login', '/admin/login?x=1'])(
      'descarta %p',
      (url) => {
        expect(safeReturnUrl(url)).toBe('/admin/ordenes');
      },
    );
  });
});
