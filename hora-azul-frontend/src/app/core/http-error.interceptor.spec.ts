import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SILENT_HTTP_ERRORS, httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    http.verify();
    consoleError.mockRestore();
  });

  function requestWithError(status: number): number | undefined {
    let receivedStatus: number | undefined;
    client.get('/api/test').subscribe({ error: (err) => (receivedStatus = err.status) });
    const req = http.expectOne('/api/test');
    if (status === 0) {
      req.error(new ProgressEvent('error'));
    } else {
      req.flush(null, { status, statusText: 'Error' });
    }
    return receivedStatus;
  }

  it('registra y relanza los errores de red', () => {
    expect(requestWithError(0)).toBe(0);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('registra y relanza los errores 5xx', () => {
    expect(requestWithError(503)).toBe(503);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('no registra los errores de peticiones marcadas como silenciosas', () => {
    let failed = false;
    client
      .get('/api/test', { context: new HttpContext().set(SILENT_HTTP_ERRORS, true) })
      .subscribe({ error: () => (failed = true) });
    http.expectOne('/api/test').error(new ProgressEvent('error'));

    expect(failed).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('relanza los errores 4xx sin registrarlos', () => {
    expect(requestWithError(404)).toBe(404);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
