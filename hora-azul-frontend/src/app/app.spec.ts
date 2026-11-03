import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { App } from './app';
import { SILENT_HTTP_ERRORS } from './core/http-error.interceptor';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
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
});
