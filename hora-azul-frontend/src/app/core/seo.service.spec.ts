import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SeoService, absoluteUrl } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  const meta = (selector: string) => document.head.querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content;
  const canonical = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const jsonLd = () => document.head.querySelectorAll('script[type="application/ld+json"]');

  beforeEach(() => {
    seo = TestBed.inject(SeoService);
    seo.setStructuredData(null);
  });

  it('absoluteUrl antepone el dominio de la tienda solo a las rutas', () => {
    expect(absoluteUrl('/cards/01-0.webp')).toBe(`${environment.siteUrl}/cards/01-0.webp`);
    expect(absoluteUrl('https://otro.com/a.jpg')).toBe('https://otro.com/a.jpg');
  });

  it('pone título, descripción, canónica y Open Graph', () => {
    seo.setPage({ title: 'Rosa — Hora Azul', description: 'Una rosa.', path: '/tarjeta/1', image: '/cards/09-0.webp' });

    expect(document.title).toBe('Rosa — Hora Azul');
    expect(meta('name="description"')).toBe('Una rosa.');
    expect(meta('property="og:title"')).toBe('Rosa — Hora Azul');
    expect(meta('property="og:description"')).toBe('Una rosa.');
    expect(meta('property="og:url"')).toBe(`${environment.siteUrl}/tarjeta/1`);
    expect(meta('property="og:image"')).toBe(`${environment.siteUrl}/cards/09-0.webp`);
    expect(canonical()!.href).toBe(`${environment.siteUrl}/tarjeta/1`);
  });

  it('no duplica la canónica al cambiar de página', () => {
    seo.setPage({ title: 'A', description: 'a', path: '/a' });
    seo.setPage({ title: 'B', description: 'b', path: '/b' });

    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(canonical()!.href).toBe(`${environment.siteUrl}/b`);
  });

  it('noindex se pone y se quita según la página', () => {
    seo.setPage({ title: 'No existe', description: 'x', path: '/tarjeta/x', noindex: true });
    expect(meta('name="robots"')).toBe('noindex');

    seo.setPage({ title: 'Catálogo', description: 'y', path: '/' });
    expect(meta('name="robots"')).toBeUndefined();
  });

  it('el JSON-LD se sustituye, se elimina y no puede cerrar su etiqueta', () => {
    seo.setStructuredData({ name: 'uno' });
    seo.setStructuredData({ name: 'Rosa </script><script>alert(1)</script>' });

    expect(jsonLd().length).toBe(1);
    const text = jsonLd()[0].textContent!;
    expect(text).not.toContain('</script>');
    expect(JSON.parse(text)).toEqual({ name: 'Rosa </script><script>alert(1)</script>' });

    seo.setStructuredData(null);
    expect(jsonLd().length).toBe(0);
  });
});
