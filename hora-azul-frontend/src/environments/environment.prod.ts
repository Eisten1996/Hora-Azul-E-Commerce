/** Configuración de producción (Cloudflare Pages). */
export const environment = {
  production: true,
  /** URL del servicio en Render (render.yaml: hora-azul-api). Cambiar si Render asigna otra. */
  apiUrl: 'https://hora-azul-api.onrender.com',
  /** Dominio público de la tienda, para URLs canónicas y vistas previas al compartir. */
  siteUrl: 'https://hora-azul-e-commerce.pages.dev',
  /** Número de WhatsApp de la tienda en formato internacional sin "+" (51 + 9 dígitos). */
  whatsappNumber: '51988331275',
};
