import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

/** Datos de búsqueda y de vista previa de una página. */
export interface PageSeo {
  title: string;
  description: string;
  /** Ruta sin dominio, por ejemplo `/tarjeta/…`; forma la URL canónica. */
  path: string;
  /** Imagen para la vista previa al compartir; relativa o absoluta. */
  image?: string | null;
  /** Pide a los buscadores que no indexen la página. */
  noindex?: boolean;
}

const STRUCTURED_DATA_ID = 'structured-data';

/** Descripción general de la tienda; la misma que `index.html`. */
export const STORE_DESCRIPTION =
  'Tarjetas de felicitaciones pop-up 3D de Hora Azul: cumpleaños, flores, amor, agradecimiento y más.';

/** URL absoluta en el dominio público de la tienda. */
export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${environment.siteUrl}${pathOrUrl}`;
}

/** Título, descripción, URL canónica, etiquetas Open Graph y datos estructurados de cada página. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setPage(seo: PageSeo): void {
    const url = absoluteUrl(seo.path);
    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (seo.image) {
      this.meta.updateTag({ property: 'og:image', content: absoluteUrl(seo.image) });
    }
    if (seo.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.meta.removeTag('name="robots"');
    }
    this.canonical().href = url;
  }

  /** Inserta o sustituye el JSON-LD de la página; `null` lo elimina. */
  setStructuredData(data: object | null): void {
    this.document.getElementById(STRUCTURED_DATA_ID)?.remove();
    if (!data) {
      return;
    }
    const script = this.document.createElement('script');
    script.id = STRUCTURED_DATA_ID;
    script.type = 'application/ld+json';
    // "<" escapado: un texto con "</script>" no puede cerrar la etiqueta
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }

  private canonical(): HTMLLinkElement {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    return link;
  }
}
