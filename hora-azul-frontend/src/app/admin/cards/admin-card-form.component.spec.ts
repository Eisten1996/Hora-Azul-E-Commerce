import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { CardDetail } from '../../models';
import { AdminAuthService } from '../core/admin-auth.service';
import { AdminCardService } from '../core/admin-card.service';
import AdminCardFormComponent from './admin-card-form.component';
import { unsavedChangesGuard } from './unsaved-changes.guard';

const CARD: CardDetail = {
  id: 'a-9',
  catalogNumber: 9,
  name: 'Rosa',
  categories: ['FLORES', 'AMOR'],
  price: 17,
  dimensions: '15 x 20 cm',
  description3d: 'Una rosa roja',
  envelopeIncluded: false,
  coverImageUrl: '/cards/09-0.webp',
  active: false,
  images: [
    { url: '/cards/09-1.webp', imageType: 'OPEN', sortOrder: 1 },
    { url: '/cards/09-0.webp', imageType: 'COVER', sortOrder: 0 },
  ],
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
};

function httpError(status: number, message?: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error: message ? { message } : null }));
}

describe('AdminCardFormComponent', () => {
  let service: {
    list: jest.Mock;
    get: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    setNotice: jest.Mock;
  };
  let navigateByUrl: jest.SpyInstance;

  function setup(id: string | null): void {
    TestBed.configureTestingModule({
      imports: [AdminCardFormComponent],
      providers: [
        provideRouter([]),
        { provide: AdminCardService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } },
      ],
    });
    navigateByUrl = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  }

  async function render(id: string | null = null): Promise<ComponentFixture<AdminCardFormComponent>> {
    setup(id);
    const fixture = TestBed.createComponent(AdminCardFormComponent);
    await fixture.whenStable();
    document.body.appendChild(fixture.nativeElement);
    return fixture;
  }

  const query = <T extends HTMLElement>(fixture: ComponentFixture<unknown>, selector: string): T =>
    fixture.nativeElement.querySelector(selector);

  async function type(fixture: ComponentFixture<unknown>, selector: string, value: string): Promise<void> {
    const input = query<HTMLInputElement>(fixture, selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function click(fixture: ComponentFixture<unknown>, selector: string): Promise<void> {
    query(fixture, selector).click();
    await fixture.whenStable();
  }

  async function selectPrice(fixture: ComponentFixture<unknown>, label: string): Promise<void> {
    const select = query<HTMLSelectElement>(fixture, '#price');
    select.selectedIndex = [...select.options].findIndex((option) => option.textContent?.trim() === label);
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  async function fillValidCard(fixture: ComponentFixture<unknown>): Promise<void> {
    await type(fixture, '#name', '  Lirios  ');
    await click(fixture, '#category-FLORES');
    await selectPrice(fixture, 'S/. 20.00');
  }

  async function submit(fixture: ComponentFixture<unknown>): Promise<void> {
    query(fixture, 'form').dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  beforeEach(() => {
    service = {
      list: jest.fn(() => of([{ catalogNumber: 33 }, { catalogNumber: 40 }])),
      get: jest.fn(() => of(CARD)),
      create: jest.fn(() => of(CARD)),
      update: jest.fn(() => of(CARD)),
      setNotice: jest.fn(),
    };
  });

  afterEach(() => {
    document.body.replaceChildren();
    sessionStorage.clear();
  });

  describe('alta', () => {
    it('propone el mayor número de catálogo más 1', async () => {
      const fixture = await render();

      expect(query<HTMLInputElement>(fixture, '#catalogNumber').value).toBe('41');
      expect(query<HTMLInputElement>(fixture, '#catalogNumber').disabled).toBe(false);
    });

    it('si no puede consultar el catálogo deja el número para escribirlo a mano', async () => {
      service.list.mockReturnValue(httpError(500));
      const fixture = await render();

      expect(query<HTMLInputElement>(fixture, '#catalogNumber').value).toBe('');
      expect(query(fixture, 'form')).not.toBeNull();
    });

    it('envía los datos normalizados, vuelve al listado y deja un mensaje de éxito', async () => {
      const fixture = await render();
      await fillValidCard(fixture);
      await click(fixture, '#add-image');
      await type(fixture, '#image-url-0', ' /cards/34-0.webp ');

      await submit(fixture);

      expect(service.create).toHaveBeenCalledWith({
        catalogNumber: 41,
        name: 'Lirios',
        categories: ['FLORES'],
        price: 20,
        dimensions: null,
        description3d: null,
        envelopeIncluded: true,
        images: [{ url: '/cards/34-0.webp', imageType: 'COVER', sortOrder: 0 }],
      });
      expect(service.setNotice).toHaveBeenCalledWith('"Lirios" se creó correctamente.');
      expect(navigateByUrl).toHaveBeenCalledWith('/admin/tarjetas');
    });

    it('un 409 muestra el error junto al número y conserva el formulario', async () => {
      service.create.mockReturnValue(httpError(409));
      const fixture = await render();
      await fillValidCard(fixture);

      await submit(fixture);

      expect(query(fixture, '#catalogNumber-error').textContent).toContain('ya está en uso');
      expect(document.activeElement).toBe(query(fixture, '#catalogNumber'));
      expect(query<HTMLInputElement>(fixture, '#name').value).toBe('  Lirios  ');
      expect(navigateByUrl).not.toHaveBeenCalled();
      expect(query<HTMLButtonElement>(fixture, 'button[type="submit"]').disabled).toBe(false);
    });

    it.each([
      [422, 'El precio no es válido', 'El precio no es válido'],
      [500, undefined, 'No se pudo guardar'],
      [0, undefined, 'No se pudo guardar'],
    ])('un error %i se muestra en el formulario y permite reintentar', async (status, message, expected) => {
      service.create.mockReturnValueOnce(httpError(status, message));
      const fixture = await render();
      await fillValidCard(fixture);

      await submit(fixture);
      expect(query(fixture, '[role="alert"]').textContent).toContain(expected);

      await submit(fixture);
      expect(service.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('validaciones', () => {
    it('no envía un formulario inválido, muestra cada error y enfoca el primero', async () => {
      service.list.mockReturnValue(httpError(500));
      const fixture = await render();

      await submit(fixture);

      expect(service.create).not.toHaveBeenCalled();
      for (const id of ['catalogNumber', 'name', 'categories', 'price']) {
        expect(query(fixture, `#${id}-error`)).not.toBeNull();
      }
      expect(document.activeElement).toBe(query(fixture, '#catalogNumber'));
    });

    it.each([
      ['0', 'mayor o igual a 1'],
      ['1.5', 'mayor o igual a 1'],
      ['-3', 'mayor o igual a 1'],
    ])('rechaza el número de catálogo %s', async (value, expected) => {
      const fixture = await render();
      await type(fixture, '#catalogNumber', value);

      expect(query(fixture, '#catalogNumber-error').textContent).toContain(expected);
    });

    it('un nombre con solo espacios no es válido', async () => {
      const fixture = await render();
      await type(fixture, '#name', '    ');

      expect(query(fixture, '#name-error').textContent).toContain('Indica el nombre');
    });

    it('limita dimensiones a 50 y descripción a 300 caracteres', async () => {
      const fixture = await render();
      await type(fixture, '#dimensions', 'x'.repeat(51));
      await type(fixture, '#description3d', 'x'.repeat(301));

      expect(query(fixture, '#dimensions-error')).not.toBeNull();
      expect(query(fixture, '#description3d-error')).not.toBeNull();
    });

    it('quitar la única categoría vuelve a mostrar el error', async () => {
      const fixture = await render();
      await click(fixture, '#category-AMOR');
      expect(query(fixture, '#categories-error')).toBeNull();

      await click(fixture, '#category-AMOR');
      expect(query(fixture, '#categories-error')).not.toBeNull();
    });

    it('una imagen sin dirección impide guardar y recibe el foco', async () => {
      const fixture = await render();
      await fillValidCard(fixture);
      await click(fixture, '#add-image');

      await submit(fixture);

      expect(service.create).not.toHaveBeenCalled();
      expect(query(fixture, '#image-error-0')).not.toBeNull();
      expect(document.activeElement).toBe(query(fixture, '#image-url-0'));
    });
  });

  describe('edición', () => {
    it('muestra los datos con el número de solo lectura y las imágenes en orden', async () => {
      const fixture = await render('a-9');

      expect(service.get).toHaveBeenCalledWith('a-9');
      expect(service.list).not.toHaveBeenCalled();
      const number = query<HTMLInputElement>(fixture, '#catalogNumber');
      expect(number.value).toBe('9');
      expect(number.disabled).toBe(true);
      expect(query<HTMLInputElement>(fixture, '#name').value).toBe('Rosa');
      expect(query<HTMLInputElement>(fixture, '#category-AMOR').checked).toBe(true);
      expect(query<HTMLSelectElement>(fixture, '#price').selectedOptions[0].textContent?.trim()).toBe('S/. 17.00');
      expect(query<HTMLInputElement>(fixture, '#image-url-0').value).toBe('/cards/09-0.webp');
      expect(query<HTMLInputElement>(fixture, '#image-url-1').value).toBe('/cards/09-1.webp');
      expect(fixture.nativeElement.textContent).toContain('Inactiva');
    });

    it('guarda sin enviar el número de catálogo', async () => {
      const fixture = await render('a-9');
      await type(fixture, '#name', 'Rosa roja');

      await submit(fixture);

      const [id, payload] = service.update.mock.calls[0];
      expect(id).toBe('a-9');
      expect(payload).not.toHaveProperty('catalogNumber');
      expect(payload).toMatchObject({
        name: 'Rosa roja',
        categories: ['FLORES', 'AMOR'],
        price: 17,
        dimensions: '15 x 20 cm',
        envelopeIncluded: false,
      });
      expect(service.setNotice).toHaveBeenCalledWith('"Rosa roja" se actualizó correctamente.');
    });

    it('un 404 indica que no se encontró', async () => {
      service.get.mockReturnValue(httpError(404));
      const fixture = await render('a-9');

      expect(fixture.nativeElement.textContent).toContain('Tarjeta no encontrada');
      expect(query(fixture, 'a[href="/admin/tarjetas"]')).not.toBeNull();
    });

    it('un error de carga permite reintentar', async () => {
      service.get.mockReturnValueOnce(httpError(500));
      const fixture = await render('a-9');

      await click(fixture, '[role="alert"] button');

      expect(service.get).toHaveBeenCalledTimes(2);
      expect(query<HTMLInputElement>(fixture, '#name').value).toBe('Rosa');
    });
  });

  describe('imágenes', () => {
    it('admite hasta 10 imágenes', async () => {
      const fixture = await render();

      for (let i = 0; i < 10; i++) {
        await click(fixture, '#add-image');
      }

      expect(fixture.nativeElement.querySelectorAll('[id^="image-url-"]')).toHaveLength(10);
      expect(query<HTMLButtonElement>(fixture, '#add-image').disabled).toBe(true);
      expect(query(fixture, '#add-image').textContent).toContain('Máximo de 10');
    });

    it('la primera imagen nueva es la portada y las demás, tarjeta abierta', async () => {
      const fixture = await render();
      await click(fixture, '#add-image');
      await click(fixture, '#add-image');

      expect(query<HTMLSelectElement>(fixture, '#image-type-0').value).toBe('COVER');
      expect(query<HTMLSelectElement>(fixture, '#image-type-1').value).toBe('OPEN');
    });

    it('reordenar cambia el orden que se guarda', async () => {
      const fixture = await render('a-9');

      await click(fixture, '#image-down-0');
      expect(query<HTMLInputElement>(fixture, '#image-url-0').value).toBe('/cards/09-1.webp');
      await submit(fixture);

      expect(service.update.mock.calls[0][1].images).toEqual([
        { url: '/cards/09-1.webp', imageType: 'OPEN', sortOrder: 0 },
        { url: '/cards/09-0.webp', imageType: 'COVER', sortOrder: 1 },
      ]);
    });

    it('al reordenar, el foco sigue en un botón usable', async () => {
      const fixture = await render('a-9');

      await click(fixture, '#image-down-0');
      expect(document.activeElement).toBe(query(fixture, '#image-up-1'));

      await click(fixture, '#image-up-1');
      expect(document.activeElement).toBe(query(fixture, '#image-down-0'));
    });

    it('quitar una imagen la elimina de lo que se guarda', async () => {
      const fixture = await render('a-9');

      await click(fixture, 'button[aria-label="Quitar imagen 1"]');
      await submit(fixture);

      expect(service.update.mock.calls[0][1].images).toEqual([
        { url: '/cards/09-1.webp', imageType: 'OPEN', sortOrder: 0 },
      ]);
    });

    it('una imagen que no carga avisa sin impedir el guardado', async () => {
      const fixture = await render('a-9');
      const preview = query<HTMLImageElement>(fixture, 'img[alt="Vista previa de la imagen 1"]');

      preview.dispatchEvent(new Event('error'));
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain('Esta imagen no carga');

      await submit(fixture);
      expect(service.update).toHaveBeenCalled();
    });

    it('el aviso desaparece cuando la imagen carga', async () => {
      const fixture = await render('a-9');
      const preview = query<HTMLImageElement>(fixture, 'img[alt="Vista previa de la imagen 1"]');

      preview.dispatchEvent(new Event('error'));
      await fixture.whenStable();
      preview.dispatchEvent(new Event('load'));
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).not.toContain('Esta imagen no carga');
    });

    it('la vista previa se actualiza al salir del campo', async () => {
      const fixture = await render();
      await click(fixture, '#add-image');
      expect(query(fixture, 'img[alt="Vista previa de la imagen 1"]')).toBeNull();

      await type(fixture, '#image-url-0', '/cards/34-0.webp');

      expect(query<HTMLImageElement>(fixture, 'img[alt="Vista previa de la imagen 1"]').getAttribute('src')).toBe('/cards/34-0.webp');
    });
  });

  describe('cambios sin guardar', () => {
    const runGuard = (fixture: ComponentFixture<AdminCardFormComponent>) =>
      TestBed.runInInjectionContext(() =>
        unsavedChangesGuard(fixture.componentInstance, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, {} as RouterStateSnapshot),
      ) as boolean | Promise<boolean>;

    function logIn(): void {
      jest.spyOn(TestBed.inject(AdminAuthService), 'isLoggedIn').mockReturnValue(true);
    }

    const dialogButton = (fixture: ComponentFixture<unknown>, text: string): HTMLButtonElement =>
      [...fixture.nativeElement.querySelectorAll('dialog button')].find((button) => button.textContent.trim() === text);

    it('sin cambios deja salir sin preguntar', async () => {
      const fixture = await render('a-9');
      logIn();

      expect(runGuard(fixture)).toBe(true);
    });

    it('proponer el número de catálogo no cuenta como cambio', async () => {
      const fixture = await render();
      logIn();

      expect(runGuard(fixture)).toBe(true);
    });

    it('con cambios pregunta y permite seguir editando', async () => {
      const fixture = await render('a-9');
      logIn();
      await type(fixture, '#name', 'Otro nombre');

      const result = runGuard(fixture);
      await fixture.whenStable();
      expect(query<HTMLDialogElement>(fixture, 'dialog').open).toBe(true);

      dialogButton(fixture, 'Seguir editando').click();
      await expect(result).resolves.toBe(false);
      await fixture.whenStable();
      expect(query<HTMLDialogElement>(fixture, 'dialog').open).toBe(false);
    });

    it('con cambios pregunta y permite descartarlos', async () => {
      const fixture = await render('a-9');
      logIn();
      await click(fixture, '#add-image');

      const result = runGuard(fixture);
      await fixture.whenStable();
      dialogButton(fixture, 'Salir sin guardar').click();

      await expect(result).resolves.toBe(true);
    });

    it.each(['#image-down-0', 'button[aria-label="Quitar imagen 1"]'])('%s cuenta como cambio', async (selector) => {
      const fixture = await render('a-9');
      logIn();
      await click(fixture, selector);

      expect(runGuard(fixture)).toBeInstanceOf(Promise);
    });

    it('tras guardar no pregunta', async () => {
      const fixture = await render('a-9');
      logIn();
      await type(fixture, '#name', 'Otro nombre');
      await submit(fixture);

      expect(runGuard(fixture)).toBe(true);
    });

    it('si un 401 cerró la sesión no pregunta', async () => {
      const fixture = await render('a-9');
      await type(fixture, '#name', 'Otro nombre');

      expect(runGuard(fixture)).toBe(true);
    });

    it('avisa al cerrar o recargar la pestaña solo si hay cambios', async () => {
      const fixture = await render('a-9');
      const unload = () => {
        const event = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      };
      expect(unload()).toBe(false);

      await type(fixture, '#name', 'Otro nombre');

      expect(unload()).toBe(true);
    });
  });
});
