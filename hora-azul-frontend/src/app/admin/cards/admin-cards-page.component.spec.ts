import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { AdminCard, AdminCardService, nextCatalogNumber } from '../core/admin-card.service';
import AdminCardsPageComponent, { filterAdminCards } from './admin-cards-page.component';

const ACTIVE: AdminCard = {
  id: 'a-1',
  catalogNumber: 1,
  name: 'Pastel de cumpleaños',
  categories: ['CUMPLEANOS'],
  price: 15,
  coverImageUrl: '/cards/01-0.webp',
  active: true,
};
const INACTIVE: AdminCard = {
  id: 'a-12',
  catalogNumber: 12,
  name: 'Lirios',
  categories: ['FLORES', 'AMOR'],
  price: 20,
  coverImageUrl: null,
  active: false,
};

describe('filterAdminCards', () => {
  const cards = [ACTIVE, INACTIVE];

  it('filtra por estado', () => {
    expect(filterAdminCards(cards, 'all', '')).toEqual(cards);
    expect(filterAdminCards(cards, 'active', '')).toEqual([ACTIVE]);
    expect(filterAdminCards(cards, 'inactive', '')).toEqual([INACTIVE]);
  });

  it('busca por nombre sin distinguir mayúsculas ni tildes, y por número', () => {
    expect(filterAdminCards(cards, 'all', 'CUMPLEANOS')).toEqual([ACTIVE]);
    expect(filterAdminCards(cards, 'all', '  lirios ')).toEqual([INACTIVE]);
    expect(filterAdminCards(cards, 'all', '12')).toEqual([INACTIVE]);
    expect(filterAdminCards(cards, 'inactive', 'pastel')).toEqual([]);
  });
});

describe('nextCatalogNumber', () => {
  it('propone el mayor existente más 1, y 1 si no hay tarjetas', () => {
    expect(nextCatalogNumber([ACTIVE, INACTIVE])).toBe(13);
    expect(nextCatalogNumber([])).toBe(1);
  });
});

describe('AdminCardsPageComponent', () => {
  let list: jest.Mock<Observable<AdminCard[]>>;
  let setActive: jest.Mock<Observable<unknown>, [string, boolean]>;
  let notice: string;

  beforeEach(() => {
    list = jest.fn(() => of([ACTIVE, INACTIVE]));
    setActive = jest.fn(() => of({}));
    notice = '';
    TestBed.configureTestingModule({
      imports: [AdminCardsPageComponent],
      providers: [
        provideRouter([]),
        { provide: AdminCardService, useValue: { list, setActive, takeNotice: () => notice } },
      ],
    });
  });

  async function render(): Promise<ComponentFixture<AdminCardsPageComponent>> {
    const fixture = TestBed.createComponent(AdminCardsPageComponent);
    await fixture.whenStable();
    return fixture;
  }

  function buttonByLabel(fixture: ComponentFixture<unknown>, label: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(`button[aria-label="${label}"]`);
  }

  function dialogButton(fixture: ComponentFixture<unknown>, text: string): HTMLButtonElement {
    const buttons: HTMLButtonElement[] = [...fixture.nativeElement.querySelectorAll('dialog button')];
    return buttons.find((button) => button.textContent?.trim() === text)!;
  }

  it('mientras carga muestra el aviso de carga', async () => {
    list.mockReturnValue(new Subject<AdminCard[]>());
    const fixture = await render();

    expect(fixture.nativeElement.textContent).toContain('Cargando tarjetas');
  });

  it('lista portada, número, nombre, categorías, precio y estado', async () => {
    const element: HTMLElement = (await render()).nativeElement;

    const row = element.querySelector('[data-testid="card-12"]')!;
    for (const expected of ['Nº 12', 'Lirios', 'Flores, Amor', 'S/. 20.00', 'Inactiva']) {
      expect(row.textContent).toContain(expected);
    }
    expect(element.querySelector<HTMLImageElement>('[data-testid="card-1"] img')!.getAttribute('src')).toBe('/cards/01-0-400.webp');
    expect(element.querySelector('[data-testid="card-1"]')!.textContent).toContain('Activa');
  });

  it('filtra por estado y por búsqueda desde los controles', async () => {
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;

    const select = element.querySelector<HTMLSelectElement>('#filtro-estado')!;
    select.value = 'inactive';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(element.querySelector('[data-testid="card-1"]')).toBeNull();
    expect(element.textContent).toContain('1 de 2 tarjetas');

    const search = element.querySelector<HTMLInputElement>('#filtro-texto')!;
    search.value = 'pastel';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(element.textContent).toContain('Ninguna tarjeta coincide');
  });

  it('sin tarjetas lo indica', async () => {
    list.mockReturnValue(of([]));

    expect((await render()).nativeElement.textContent).toContain('Todavía no hay tarjetas');
  });

  it('un error de carga permite reintentar', async () => {
    list.mockReturnValueOnce(throwError(() => new Error('red')));
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role="alert"]')!.textContent).toContain('No pudimos cargar');

    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await fixture.whenStable();

    expect(list).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[data-testid="card-1"]')).not.toBeNull();
  });

  it('desactivar pide confirmación avisando de la tienda y, al confirmar, marca la tarjeta', async () => {
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;

    buttonByLabel(fixture, 'Desactivar Pastel de cumpleaños').click();
    await fixture.whenStable();
    expect(element.querySelector('dialog')!.open).toBe(true);
    expect(element.querySelector('dialog')!.textContent).toContain('Dejará de verse en la tienda');
    expect(setActive).not.toHaveBeenCalled();

    dialogButton(fixture, 'Desactivar').click();
    await fixture.whenStable();

    expect(setActive).toHaveBeenCalledWith('a-1', false);
    expect(element.querySelector('dialog')!.open).toBe(false);
    expect(element.querySelector('[data-testid="card-1"]')!.textContent).toContain('Inactiva');
    expect(element.textContent).toContain('se desactivó');
  });

  it('cancelar la confirmación no cambia nada', async () => {
    const fixture = await render();

    buttonByLabel(fixture, 'Desactivar Pastel de cumpleaños').click();
    await fixture.whenStable();
    dialogButton(fixture, 'Cancelar').click();
    await fixture.whenStable();

    expect(setActive).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('dialog').open).toBe(false);
  });

  it('Escape cierra la confirmación sin cambiar nada', async () => {
    const fixture = await render();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');

    buttonByLabel(fixture, 'Desactivar Pastel de cumpleaños').click();
    await fixture.whenStable();
    // El navegador cierra el diálogo por su cuenta al pulsar Escape
    dialog.close();
    await fixture.whenStable();

    expect(setActive).not.toHaveBeenCalled();
    buttonByLabel(fixture, 'Desactivar Pastel de cumpleaños').click();
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
  });

  it('activar una tarjeta inactiva también se confirma', async () => {
    const fixture = await render();

    buttonByLabel(fixture, 'Activar Lirios').click();
    await fixture.whenStable();
    dialogButton(fixture, 'Activar').click();
    await fixture.whenStable();

    expect(setActive).toHaveBeenCalledWith('a-12', true);
    expect(fixture.nativeElement.querySelector('[data-testid="card-12"]').textContent).toContain('Activa');
  });

  it('si falla el cambio, avisa y deja la tarjeta como estaba', async () => {
    setActive.mockReturnValue(throwError(() => new Error('red')));
    const fixture = await render();

    buttonByLabel(fixture, 'Desactivar Pastel de cumpleaños').click();
    await fixture.whenStable();
    dialogButton(fixture, 'Desactivar').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo desactivar');
    expect(fixture.nativeElement.querySelector('[data-testid="card-1"]').textContent).toContain('Activa');
  });

  it('muestra el mensaje que deja el formulario al guardar', async () => {
    notice = 'Tarjeta creada.';

    expect((await render()).nativeElement.textContent).toContain('Tarjeta creada.');
  });
});
