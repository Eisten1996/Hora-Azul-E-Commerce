// Genera public/sitemap.xml con la portada y la ficha de cada tarjeta activa.
// Uso: npm run sitemap  (lee la API de producción; solo hace peticiones GET)
// Volver a ejecutarlo y publicar el cambio después de crear o desactivar tarjetas desde el panel.
import { writeFileSync } from 'node:fs';

const SITE = 'https://hora-azul-e-commerce.pages.dev';
const API = process.env.API_URL ?? 'https://hora-azul-api.onrender.com';
const OUTPUT = new URL('../public/sitemap.xml', import.meta.url);

async function getJson(url) {
  // El plan gratuito de Render tarda hasta un minuto en despertar
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) {
    throw new Error(`${url} respondió ${response.status}`);
  }
  return response.json();
}

const escapeXml = (text) =>
  text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

const cards = [];
for (let page = 0; ; page++) {
  const result = await getJson(`${API}/api/cards?size=100&page=${page}`);
  cards.push(...result.content);
  if (page + 1 >= result.totalPages) break;
}
if (cards.length === 0) {
  throw new Error('La API no devolvió tarjetas: no se sobrescribe el sitemap.');
}

const details = await Promise.all(cards.map((card) => getJson(`${API}/api/cards/${card.id}`)));
details.sort((a, b) => a.catalogNumber - b.catalogNumber);

const entry = (loc, lastmod) =>
  `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entry(`${SITE}/`),
  ...details.map((card) => entry(`${SITE}/tarjeta/${card.id}`, card.updatedAt.slice(0, 10))),
  '</urlset>',
  '',
].join('\n');

writeFileSync(OUTPUT, xml);
console.log(`sitemap.xml: portada y ${details.length} tarjetas`);
