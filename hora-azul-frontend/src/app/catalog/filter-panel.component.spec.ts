import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogFilters, EMPTY_FILTERS } from './catalog-filter';
import { FilterPanelComponent } from './filter-panel.component';

describe('FilterPanelComponent', () => {
  let fixture: ComponentFixture<FilterPanelComponent>;
  let emitted: CatalogFilters[];

  function render(filters: CatalogFilters = EMPTY_FILTERS): HTMLElement {
    fixture = TestBed.createComponent(FilterPanelComponent);
    fixture.componentRef.setInput('filters', filters);
    emitted = [];
    fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  function inputLabelled(element: HTMLElement, text: string): HTMLInputElement {
    const label = [...element.querySelectorAll('label')].find((l) => l.textContent?.trim() === text);
    return label!.querySelector('input')!;
  }

  it('muestra las 6 categorías como checkboxes y 4 rangos más "Todos" como radios', () => {
    const element = render();
    expect(element.querySelectorAll('input[type="checkbox"]').length).toBe(6);
    expect(element.querySelectorAll('input[type="radio"]').length).toBe(5);
  });

  it('permite seleccionar varias categorías', () => {
    const element = render({ ...EMPTY_FILTERS, categories: ['FLORES'] });

    inputLabelled(element, 'Amor').click();

    expect(emitted.at(-1)?.categories).toEqual(['FLORES', 'AMOR']);
  });

  it('desmarcar una categoría la quita del filtro', () => {
    const element = render({ ...EMPTY_FILTERS, categories: ['FLORES', 'AMOR'] });

    inputLabelled(element, 'Flores').click();

    expect(emitted.at(-1)?.categories).toEqual(['AMOR']);
  });

  it('los rangos de precio son excluyentes', () => {
    const element = render({ ...EMPTY_FILTERS, priceRange: 'HASTA_15' });

    inputLabelled(element, 'Desde S/. 30.00').click();

    expect(emitted.at(-1)?.priceRange).toBe('DESDE_30');
  });

  it('dos cambios antes de que el padre actualice el input se combinan', () => {
    const element = render();

    inputLabelled(element, 'Flores').click();
    inputLabelled(element, 'Hasta S/. 20.00').click();

    expect(emitted.at(-1)).toEqual({ categories: ['FLORES'], priceRange: 'HASTA_20', search: '' });
  });

  it('emite el texto de búsqueda por cada carácter', () => {
    const search: HTMLInputElement = render().querySelector('input[type="search"]')!;

    search.value = 'r';
    search.dispatchEvent(new Event('input'));
    search.value = 'ro';
    search.dispatchEvent(new Event('input'));

    expect(emitted.map((f) => f.search)).toEqual(['r', 'ro']);
  });

  it('"Limpiar filtros" emite los filtros vacíos y se desactiva si no hay filtros', () => {
    const element = render({ categories: ['AMOR'], priceRange: 'HASTA_20', search: 'rosa' });
    const clear = [...element.querySelectorAll('button')].find((b) => b.textContent?.includes('Limpiar'))!;

    clear.click();
    expect(emitted.at(-1)).toEqual(EMPTY_FILTERS);

    fixture.componentRef.setInput('filters', EMPTY_FILTERS);
    fixture.detectChanges();
    expect(clear.disabled).toBe(true);
  });
});
