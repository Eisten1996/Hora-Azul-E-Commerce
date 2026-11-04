import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import AdminLoginComponent from './admin-login.component';

const SESSION_URL = `${environment.apiUrl}/api/admin/session`;

describe('AdminLoginComponent', () => {
  let fixture: ComponentFixture<AdminLoginComponent>;
  let http: HttpTestingController;
  let navigate: jest.SpyInstance;

  function setup(queryParams: Record<string, string> = {}): void {
    TestBed.configureTestingModule({
      imports: [AdminLoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(AdminLoginComponent);
    fixture.detectChanges();
  }

  const element = (): HTMLElement => fixture.nativeElement;
  const input = (id: string) => element().querySelector<HTMLInputElement>(`#${id}`)!;
  const button = () => element().querySelector<HTMLButtonElement>('button[type=submit]')!;

  async function submit(username = 'admin', password = 'secreto'): Promise<void> {
    for (const [id, value] of [['username', username], ['password', password]]) {
      input(id).value = value;
      input(id).dispatchEvent(new Event('input'));
    }
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  beforeEach(() => sessionStorage.clear());
  afterEach(() => http.verify());

  it('con credenciales válidas entra y lleva a la página pedida', async () => {
    setup({ returnUrl: '/admin/tarjetas' });
    await submit();

    http.expectOne(SESSION_URL).flush({ username: 'admin' });

    expect(navigate).toHaveBeenCalledWith('/admin/tarjetas');
  });

  it('sin página pedida lleva a las órdenes y descarta destinos externos', async () => {
    setup({ returnUrl: 'https://evil.test' });
    await submit();

    http.expectOne(SESSION_URL).flush({ username: 'admin' });

    expect(navigate).toHaveBeenCalledWith('/admin/ordenes');
  });

  it('mientras espera muestra la carga y deshabilita el botón', async () => {
    setup();
    await submit();

    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('Ingresando');
    expect(element().textContent).toContain('hasta un minuto');

    http.expectOne(SESSION_URL).flush({ username: 'admin' });
  });

  it('con credenciales inválidas avisa, conserva el usuario y vacía la contraseña', async () => {
    setup();
    await submit('admin', 'mala');

    http.expectOne(SESSION_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(element().querySelector('[role=alert]')?.textContent).toContain('Usuario o contraseña incorrectos');
    expect(input('username').value).toBe('admin');
    expect(input('password').value).toBe('');
    expect(navigate).not.toHaveBeenCalled();
    expect(button().disabled).toBe(false);
  });

  it.each([
    ['sin conexión', () => http.expectOne(SESSION_URL).error(new ProgressEvent('error'))],
    ['error del servidor', () => http.expectOne(SESSION_URL).flush(null, { status: 503, statusText: 'Unavailable' })],
  ])('con %s no culpa a las credenciales y permite reintentar', async (_name, fail) => {
    setup();
    await submit();

    fail();
    await fixture.whenStable();

    const alert = element().querySelector('[role=alert]')?.textContent;
    expect(alert).toContain('servidor no está disponible');
    expect(alert).not.toContain('incorrectos');
    expect(input('password').value).toBe('secreto');
    expect(button().disabled).toBe(false);
  });

  it('con campos vacíos no llama al backend y muestra los errores', async () => {
    setup();
    await submit('', '');

    expect(element().querySelector('#username-error')).not.toBeNull();
    expect(element().querySelector('#password-error')).not.toBeNull();
    expect(input('username').getAttribute('aria-invalid')).toBe('true');
  });

  it('avisa cuando la sesión expiró', () => {
    setup({ sesion: 'expirada' });

    expect(element().textContent).toContain('Tu sesión expiró');
  });
});
