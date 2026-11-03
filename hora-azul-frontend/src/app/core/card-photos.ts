/** Fotos del catálogo servidas por el frontend: /cards/NN-K.webp (800 px) con miniatura /cards/NN-K-400.webp. */
const CATALOG_PHOTO = /^\/cards\/\d+-\d+\.webp$/;

/** URL de la miniatura de 400 px; las URLs que no son fotos del catálogo se devuelven igual. */
export function thumbnailUrl(url: string): string {
  return CATALOG_PHOTO.test(url) ? url.replace(/\.webp$/, '-400.webp') : url;
}

/** {@code srcset} con la miniatura y la foto completa, o {@code null} si no es una foto del catálogo. */
export function photoSrcset(url: string): string | null {
  return CATALOG_PHOTO.test(url) ? `${thumbnailUrl(url)} 400w, ${url} 800w` : null;
}
