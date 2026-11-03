-- =============================================================================
-- Hora Azul — Catálogo 2026 de tarjetas pop-up 3D
-- Datos tomados del PDF "Catálogo Hora Azul 2026": 33 tarjetas con sus precios,
-- dimensiones, efecto 3D, categorías (una tarjeta puede tener varias) y fotos.
-- Las fotos se sirven desde el frontend en /cards/NN-K.webp.
-- Migración Flyway: se aplica una sola vez en cada base de datos (dev, test y producción)
-- Sintaxis compatible con H2 y PostgreSQL
-- =============================================================================

-- 1) Pastel de cumpleaños — Cumpleaños
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000001-0000-0000-0000-000000000001', 1, 'Pastel de cumpleaños', 15.00, '15 x 15 cm',
        'Estructura pop-up que recrea un pastel de cumpleaños de varios pisos con vela e inscripción "Happy Birthday". Portada roja con grabado láser dorado.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000001-0000-0000-0000-000000000001', 'CUMPLEANOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'COVER', 0, '/cards/01-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000001-0001-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'ENVELOPE', 1, '/cards/01-1.webp');

-- 2) Árbol de cerezo — Amor
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000002-0000-0000-0000-000000000002', 2, 'Árbol de cerezo', 30.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que representa un frondoso árbol de cerezo en flor y figuras de pareja en relieve.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000002-0000-0000-0000-000000000002', 'AMOR');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000002-0000-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', 'COVER', 0, '/cards/02-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000002-0001-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', 'ENVELOPE', 1, '/cards/02-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000002-0002-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', 'ENVELOPE', 2, '/cards/02-2.webp');

-- 3) Carrusel — Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000003-0000-0000-0000-000000000003', 3, 'Carrusel', 20.00, '13 x 16 cm',
        'Estructura pop-up de alta precisión geométrica que recrea un carrusel clásico con caballitos y una bandera superior.',
        FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000003-0000-0000-0000-000000000003', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000003-0000-0000-0000-000000000003', 'a1000003-0000-0000-0000-000000000003', 'COVER', 0, '/cards/03-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000003-0001-0000-0000-000000000003', 'a1000003-0000-0000-0000-000000000003', 'OPEN', 1, '/cards/03-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000003-0002-0000-0000-000000000003', 'a1000003-0000-0000-0000-000000000003', 'OPEN', 2, '/cards/03-2.webp');

-- 4) Carrito de flores — Cumpleaños
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000004-0000-0000-0000-000000000004', 4, 'Carrito de flores', 20.00, '12.5 x 6.5 x 13.5 cm',
        'Estructura pop-up detallada que recrea un carrito de flores, con pizarra frontal abatible y espacio interior para dedicatorias manuscritas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000004-0000-0000-0000-000000000004', 'CUMPLEANOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000004-0000-0000-0000-000000000004', 'a1000004-0000-0000-0000-000000000004', 'COVER', 0, '/cards/04-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000004-0001-0000-0000-000000000004', 'a1000004-0000-0000-0000-000000000004', 'ENVELOPE', 1, '/cards/04-1.webp');

-- 5) Árbol arce rojo — Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000005-0000-0000-0000-000000000005', 5, 'Árbol arce rojo', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea un árbol de arce (maple) otoñal en 360 grados, con un tronco marrón estructurado y follaje rojo calado en múltiples capas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000005-0000-0000-0000-000000000005', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000005-0000-0000-0000-000000000005', 'a1000005-0000-0000-0000-000000000005', 'COVER', 0, '/cards/05-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000005-0001-0000-0000-000000000005', 'a1000005-0000-0000-0000-000000000005', 'ENVELOPE', 1, '/cards/05-1.webp');

-- 6) Rosa — Flores, Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000006-0000-0000-0000-000000000006', 6, 'Rosa', 17.00, '10 x 15 cm',
        'Estructura pop-up que recrea una rosa roja abierta con pétalos entrelazados de gran volumen.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000006-0000-0000-0000-000000000006', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000006-0000-0000-0000-000000000006', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000006-0000-0000-0000-000000000006', 'a1000006-0000-0000-0000-000000000006', 'COVER', 0, '/cards/06-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000006-0001-0000-0000-000000000006', 'a1000006-0000-0000-0000-000000000006', 'ENVELOPE', 1, '/cards/06-1.webp');

-- 7) Colibrí — Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000007-0000-0000-0000-000000000007', 7, 'Colibrí', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea un colibrí con las alas extendidas en posición de vuelo y un degradado de color realista.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000007-0000-0000-0000-000000000007', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000007-0000-0000-0000-000000000007', 'a1000007-0000-0000-0000-000000000007', 'COVER', 0, '/cards/07-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000007-0001-0000-0000-000000000007', 'a1000007-0000-0000-0000-000000000007', 'ENVELOPE', 1, '/cards/07-1.webp');

-- 8) Gladioles — Flores, Mejores deseos
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000008-0000-0000-0000-000000000008', 8, 'Gladioles', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea un ramo de gladioles con cono envolvente y un lazo tridimensional en relieve en la base.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000008-0000-0000-0000-000000000008', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000008-0000-0000-0000-000000000008', 'MEJORES_DESEOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000008-0000-0000-0000-000000000008', 'a1000008-0000-0000-0000-000000000008', 'COVER', 0, '/cards/08-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000008-0001-0000-0000-000000000008', 'a1000008-0000-0000-0000-000000000008', 'ENVELOPE', 1, '/cards/08-1.webp');

-- 9) Corazón de flores — Flores, Amor, Agradecimiento
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000009-0000-0000-0000-000000000009', 9, 'Corazón de flores', 20.00, '15 x 15 cm',
        'Estructura pop-up de gran volumen en forma de corazón floral denso con detalles de calado láser multicapa.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000009-0000-0000-0000-000000000009', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000009-0000-0000-0000-000000000009', 'AMOR');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000009-0000-0000-0000-000000000009', 'AGRADECIMIENTO');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000009-0000-0000-0000-000000000009', 'a1000009-0000-0000-0000-000000000009', 'COVER', 0, '/cards/09-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000009-0001-0000-0000-000000000009', 'a1000009-0000-0000-0000-000000000009', 'OPEN', 1, '/cards/09-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000009-0002-0000-0000-000000000009', 'a1000009-0000-0000-0000-000000000009', 'ENVELOPE', 2, '/cards/09-2.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000009-0003-0000-0000-000000000009', 'a1000009-0000-0000-0000-000000000009', 'ENVELOPE', 3, '/cards/09-3.webp');

-- 10) Mariposas de colores — Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000010-0000-0000-0000-000000000010', 10, 'Mariposas de colores', 20.00, '12.7 x 17.8 cm',
        'Estructura pop-up de alta precisión que recrea un grupo de múltiples mariposas multicolores en posición de vuelo sobre ramas y flores en relieve.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000010-0000-0000-0000-000000000010', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000010-0000-0000-0000-000000000010', 'a1000010-0000-0000-0000-000000000010', 'COVER', 0, '/cards/10-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000010-0001-0000-0000-000000000010', 'a1000010-0000-0000-0000-000000000010', 'OPEN', 1, '/cards/10-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000010-0002-0000-0000-000000000010', 'a1000010-0000-0000-0000-000000000010', 'ENVELOPE', 2, '/cards/10-2.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000010-0003-0000-0000-000000000010', 'a1000010-0000-0000-0000-000000000010', 'ENVELOPE', 3, '/cards/10-3.webp');

-- 11) Lirios — Flores, Mejores deseos, Agradecimiento
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000011-0000-0000-0000-000000000011', 11, 'Lirios', 20.00, '15 x 15 cm',
        'Estructura pop-up de alta precisión que simula un jarrón o florero texturizado con un ramo denso de lirios de gran volumen y realismo.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000011-0000-0000-0000-000000000011', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000011-0000-0000-0000-000000000011', 'MEJORES_DESEOS');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000011-0000-0000-0000-000000000011', 'AGRADECIMIENTO');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000011-0000-0000-0000-000000000011', 'a1000011-0000-0000-0000-000000000011', 'COVER', 0, '/cards/11-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000011-0001-0000-0000-000000000011', 'a1000011-0000-0000-0000-000000000011', 'OPEN', 1, '/cards/11-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000011-0002-0000-0000-000000000011', 'a1000011-0000-0000-0000-000000000011', 'ENVELOPE', 2, '/cards/11-2.webp');

-- 12) Margaritas — Flores, Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000012-0000-0000-0000-000000000012', 12, 'Margaritas', 20.00, '12.7 x 17.8 cm',
        'Estructura pop-up de alta precisión que recrea un ramillete silvestre de margaritas blancas caladas a láser en múltiples capas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000012-0000-0000-0000-000000000012', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000012-0000-0000-0000-000000000012', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000012-0000-0000-0000-000000000012', 'a1000012-0000-0000-0000-000000000012', 'COVER', 0, '/cards/12-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000012-0001-0000-0000-000000000012', 'a1000012-0000-0000-0000-000000000012', 'ENVELOPE', 1, '/cards/12-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000012-0002-0000-0000-000000000012', 'a1000012-0000-0000-0000-000000000012', 'ENVELOPE', 2, '/cards/12-2.webp');

-- 13) Árbol de cerezo en corazón — Flores, Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000013-0000-0000-0000-000000000013', 13, 'Árbol de cerezo en corazón', 20.00, '15 x 15 cm',
        'Estructura pop-up tridimensional que representa un árbol de cerezo con copa en forma de corazón y follaje calado a láser.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000013-0000-0000-0000-000000000013', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000013-0000-0000-0000-000000000013', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000013-0000-0000-0000-000000000013', 'a1000013-0000-0000-0000-000000000013', 'COVER', 0, '/cards/13-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000013-0001-0000-0000-000000000013', 'a1000013-0000-0000-0000-000000000013', 'OPEN', 1, '/cards/13-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000013-0002-0000-0000-000000000013', 'a1000013-0000-0000-0000-000000000013', 'ENVELOPE', 2, '/cards/13-2.webp');

-- 14) Ramo de tulipanes — Flores, Agradecimiento
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000014-0000-0000-0000-000000000014', 14, 'Ramo de tulipanes', 30.00, '21.6 x 21.4 cm',
        'Estructura pop-up de gran escala que recrea un jarrón facetado con un denso y voluminoso ramo esférico de tulipanes multicolores en capas troqueladas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000014-0000-0000-0000-000000000014', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000014-0000-0000-0000-000000000014', 'AGRADECIMIENTO');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000014-0000-0000-0000-000000000014', 'a1000014-0000-0000-0000-000000000014', 'COVER', 0, '/cards/14-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000014-0001-0000-0000-000000000014', 'a1000014-0000-0000-0000-000000000014', 'OPEN', 1, '/cards/14-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000014-0002-0000-0000-000000000014', 'a1000014-0000-0000-0000-000000000014', 'ENVELOPE', 2, '/cards/14-2.webp');

-- 15) Ramo de rosas — Flores, Mejores deseos
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000015-0000-0000-0000-000000000015', 15, 'Ramo de rosas', 30.00, '18 x 22.5 cm',
        'Estructura pop-up a gran escala que recrea un ramillete esférico de rosas multicolores y lazos en múltiples capas troqueladas sobre un jarrón integrado.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000015-0000-0000-0000-000000000015', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000015-0000-0000-0000-000000000015', 'MEJORES_DESEOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000015-0000-0000-0000-000000000015', 'a1000015-0000-0000-0000-000000000015', 'COVER', 0, '/cards/15-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000015-0001-0000-0000-000000000015', 'a1000015-0000-0000-0000-000000000015', 'OPEN', 1, '/cards/15-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000015-0002-0000-0000-000000000015', 'a1000015-0000-0000-0000-000000000015', 'ENVELOPE', 2, '/cards/15-2.webp');

-- 16) Oso rosa — Mejores deseos
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000016-0000-0000-0000-000000000016', 16, 'Oso rosa', 15.00, '10.5 x 10.5 cm',
        'Estructura pop-up de estilo ilustrado que destaca tres capas de relieve independientes: un helado con cereza, un osito animado y un arcoíris en tonos pastel.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000016-0000-0000-0000-000000000016', 'MEJORES_DESEOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000016-0000-0000-0000-000000000016', 'a1000016-0000-0000-0000-000000000016', 'COVER', 0, '/cards/16-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000016-0001-0000-0000-000000000016', 'a1000016-0000-0000-0000-000000000016', 'OPEN', 1, '/cards/16-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000016-0002-0000-0000-000000000016', 'a1000016-0000-0000-0000-000000000016', 'ENVELOPE', 2, '/cards/16-2.webp');

-- 17) Gato amarillo — Mejores deseos
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000017-0000-0000-0000-000000000017', 17, 'Gato amarillo', 15.00, '10.5 x 10.5 cm',
        'Estructura pop-up de estilo ilustrado con tres elementos en relieve independientes: un helado de cono, un gatito central animado con un tulipán y detalles de dulces de fondo.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000017-0000-0000-0000-000000000017', 'MEJORES_DESEOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000017-0000-0000-0000-000000000017', 'a1000017-0000-0000-0000-000000000017', 'COVER', 0, '/cards/17-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000017-0001-0000-0000-000000000017', 'a1000017-0000-0000-0000-000000000017', 'ENVELOPE', 1, '/cards/17-1.webp');

-- 18) Gato verde — Mejores deseos
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000018-0000-0000-0000-000000000018', 18, 'Gato verde', 15.00, '10.5 x 10.5 cm',
        'Estructura pop-up de estilo ilustrado con capas de relieve que recrean a un personaje felino conduciendo un automóvil y detalles de viaje al fondo.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000018-0000-0000-0000-000000000018', 'MEJORES_DESEOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000018-0000-0000-0000-000000000018', 'a1000018-0000-0000-0000-000000000018', 'COVER', 0, '/cards/18-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000018-0001-0000-0000-000000000018', 'a1000018-0000-0000-0000-000000000018', 'ENVELOPE', 1, '/cards/18-1.webp');

-- 19) Gol — Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000019-0000-0000-0000-000000000019', 19, 'Gol', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea un arco de fútbol con textura de red y siluetas caladas de jugadores en acción con uniformes multicolores.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000019-0000-0000-0000-000000000019', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000019-0000-0000-0000-000000000019', 'a1000019-0000-0000-0000-000000000019', 'COVER', 0, '/cards/19-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000019-0001-0000-0000-000000000019', 'a1000019-0000-0000-0000-000000000019', 'OPEN', 1, '/cards/19-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000019-0002-0000-0000-000000000019', 'a1000019-0000-0000-0000-000000000019', 'ENVELOPE', 2, '/cards/19-2.webp');

-- 20) I Love You — Amor
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000020-0000-0000-0000-000000000020', 20, 'I Love You', 17.00, '15 x 20 cm',
        'Estructura pop-up de corte preciso que forma un corazón tridimensional de estilo pixelado o escalonado con la inscripción "I Love You".',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000020-0000-0000-0000-000000000020', 'AMOR');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000020-0000-0000-0000-000000000020', 'a1000020-0000-0000-0000-000000000020', 'COVER', 0, '/cards/20-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000020-0001-0000-0000-000000000020', 'a1000020-0000-0000-0000-000000000020', 'ENVELOPE', 1, '/cards/20-1.webp');

-- 21) Carrito arcoíris del amor — Amor
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000021-0000-0000-0000-000000000021', 21, 'Carrito arcoíris del amor', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea una camioneta clásica tridimensional cargada de obsequios, detalles botánicos y globos de corazón tridimensionales.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000021-0000-0000-0000-000000000021', 'AMOR');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000021-0000-0000-0000-000000000021', 'a1000021-0000-0000-0000-000000000021', 'COVER', 0, '/cards/21-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000021-0001-0000-0000-000000000021', 'a1000021-0000-0000-0000-000000000021', 'OPEN', 1, '/cards/21-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000021-0002-0000-0000-000000000021', 'a1000021-0000-0000-0000-000000000021', 'ENVELOPE', 2, '/cards/21-2.webp');

-- 22) Pavo real — Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000022-0000-0000-0000-000000000022', 22, 'Pavo real', 30.00, '15 x 20 cm',
        'Estructura pop-up de alta fidelidad con cuerpo esculpido en tono plateado y un abanico plumífero multicolor calado con láser en capas de efecto óptico brillante.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000022-0000-0000-0000-000000000022', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000022-0000-0000-0000-000000000022', 'a1000022-0000-0000-0000-000000000022', 'COVER', 0, '/cards/22-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000022-0001-0000-0000-000000000022', 'a1000022-0000-0000-0000-000000000022', 'OPEN', 1, '/cards/22-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000022-0002-0000-0000-000000000022', 'a1000022-0000-0000-0000-000000000022', 'ENVELOPE', 2, '/cards/22-2.webp');

-- 23) Nidito de amor — Amor, Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000023-0000-0000-0000-000000000023', 23, 'Nidito de amor', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea a una pareja de aves en su nido bajo un arco botánico tridimensional en forma de corazón.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000023-0000-0000-0000-000000000023', 'AMOR');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000023-0000-0000-0000-000000000023', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000023-0000-0000-0000-000000000023', 'a1000023-0000-0000-0000-000000000023', 'COVER', 0, '/cards/23-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000023-0001-0000-0000-000000000023', 'a1000023-0000-0000-0000-000000000023', 'ENVELOPE', 1, '/cards/23-1.webp');

-- 24) Mi media palta cumpleañera — Cumpleaños
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000024-0000-0000-0000-000000000024', 24, 'Mi media palta cumpleañera', 20.00, '12.6 x 17.6 cm',
        'Estructura pop-up de alta precisión que recrea dos mitades de aguacates animados en relieve con complementos festivos (caja de regalo, gorro de fiesta y globos).',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000024-0000-0000-0000-000000000024', 'CUMPLEANOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000024-0000-0000-0000-000000000024', 'a1000024-0000-0000-0000-000000000024', 'COVER', 0, '/cards/24-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000024-0001-0000-0000-000000000024', 'a1000024-0000-0000-0000-000000000024', 'ENVELOPE', 1, '/cards/24-1.webp');

-- 25) Tulipanes — Flores, Mejores deseos
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000025-0000-0000-0000-000000000025', 25, 'Tulipanes', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea un cono de obsequio a rayas con un denso ramo de tulipanes en capas troqueladas y un gran lazo calado en la base.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000025-0000-0000-0000-000000000025', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000025-0000-0000-0000-000000000025', 'MEJORES_DESEOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000025-0000-0000-0000-000000000025', 'a1000025-0000-0000-0000-000000000025', 'COVER', 0, '/cards/25-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000025-0001-0000-0000-000000000025', 'a1000025-0000-0000-0000-000000000025', 'ENVELOPE', 1, '/cards/25-1.webp');

-- 26) Caja sorpresa — Cumpleaños
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000026-0000-0000-0000-000000000026', 26, 'Caja sorpresa', 30.00, '19.2 x 8.6 cm',
        'Estructura tipo Explosion Box multinivel de gran impacto visual mostrando una caja con obsequios, globos y letrero de cumpleaños.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000026-0000-0000-0000-000000000026', 'CUMPLEANOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000026-0000-0000-0000-000000000026', 'a1000026-0000-0000-0000-000000000026', 'COVER', 0, '/cards/26-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000026-0001-0000-0000-000000000026', 'a1000026-0000-0000-0000-000000000026', 'ENVELOPE', 1, '/cards/26-1.webp');

-- 27) Ramo de claveles — Flores, Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000027-0000-0000-0000-000000000027', 27, 'Ramo de claveles', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea un ramillete esférico de flores silvestres en múltiples capas caladas sobre un envoltorio estilo papel Kraft texturizado con un lazo rosa.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000027-0000-0000-0000-000000000027', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000027-0000-0000-0000-000000000027', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000027-0000-0000-0000-000000000027', 'a1000027-0000-0000-0000-000000000027', 'COVER', 0, '/cards/27-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000027-0001-0000-0000-000000000027', 'a1000027-0000-0000-0000-000000000027', 'ENVELOPE', 1, '/cards/27-1.webp');

-- 28) Mariposas — Flores, Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000028-0000-0000-0000-000000000028', 28, 'Mariposas', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta fidelidad y gran volumen que recrea un arbusto esférico de hortensias moradas cubierto por múltiples mariposas tridimensionales en capas troqueladas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000028-0000-0000-0000-000000000028', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000028-0000-0000-0000-000000000028', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000028-0000-0000-0000-000000000028', 'a1000028-0000-0000-0000-000000000028', 'COVER', 0, '/cards/28-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000028-0001-0000-0000-000000000028', 'a1000028-0000-0000-0000-000000000028', 'OPEN', 1, '/cards/28-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000028-0002-0000-0000-000000000028', 'a1000028-0000-0000-0000-000000000028', 'ENVELOPE', 2, '/cards/28-2.webp');

-- 29) Árbol de mariposas — Flores, Amor, Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000029-0000-0000-0000-000000000029', 29, 'Árbol de mariposas', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea un árbol tridimensional con tronco rígido y una densa copa formada por múltiples capas de mariposas multicolores troqueladas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000029-0000-0000-0000-000000000029', 'FLORES');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000029-0000-0000-0000-000000000029', 'AMOR');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000029-0000-0000-0000-000000000029', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000029-0000-0000-0000-000000000029', 'a1000029-0000-0000-0000-000000000029', 'COVER', 0, '/cards/29-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000029-0001-0000-0000-000000000029', 'a1000029-0000-0000-0000-000000000029', 'ENVELOPE', 1, '/cards/29-1.webp');

-- 30) Casita de corgis — Sin mensaje predefinido
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000030-0000-0000-0000-000000000030', 30, 'Casita de corgis', 20.00, '15 x 20 cm',
        'Estructura pop-up de alta precisión que recrea una casita de perro tridimensional con un personaje Corgi animado al centro y elementos tridimensionales adyacentes (plato de comida y juguete).',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000030-0000-0000-0000-000000000030', 'SIN_MENSAJE');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000030-0000-0000-0000-000000000030', 'a1000030-0000-0000-0000-000000000030', 'COVER', 0, '/cards/30-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000030-0001-0000-0000-000000000030', 'a1000030-0000-0000-0000-000000000030', 'OPEN', 1, '/cards/30-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000030-0002-0000-0000-000000000030', 'a1000030-0000-0000-0000-000000000030', 'ENVELOPE', 2, '/cards/30-2.webp');

-- 31) Tienda de amor — Amor
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000031-0000-0000-0000-000000000031', 31, 'Tienda de amor', 20.00, '15 x 20 cm',
        'Estructura pop-up multinivel de alta precisión que recrea una romántica tienda o cafetería con toldo, vitrinas decoradas, un árbol con follaje de corazones y un tierno personaje canino con gafas de corazón.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000031-0000-0000-0000-000000000031', 'AMOR');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000031-0000-0000-0000-000000000031', 'a1000031-0000-0000-0000-000000000031', 'COVER', 0, '/cards/31-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000031-0001-0000-0000-000000000031', 'a1000031-0000-0000-0000-000000000031', 'OPEN', 1, '/cards/31-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000031-0002-0000-0000-000000000031', 'a1000031-0000-0000-0000-000000000031', 'ENVELOPE', 2, '/cards/31-2.webp');

-- 32) Trencito de amor — Amor
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000032-0000-0000-0000-000000000032', 32, 'Trencito de amor', 20.00, '15 x 20 cm',
        'Estructura pop-up multinivel de alta precisión que recrea un tren romántico con locomotora y vagones tridimensionales, un tierno personaje canino con gafas de corazón y humo en forma de regalos.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000032-0000-0000-0000-000000000032', 'AMOR');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000032-0000-0000-0000-000000000032', 'a1000032-0000-0000-0000-000000000032', 'COVER', 0, '/cards/32-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000032-0001-0000-0000-000000000032', 'a1000032-0000-0000-0000-000000000032', 'ENVELOPE', 1, '/cards/32-1.webp');

-- 33) Girasol y la mariposa monarca — Amor, Mejores deseos
INSERT INTO tarjeta (id, catalog_number, name, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000033-0000-0000-0000-000000000033', 33, 'Girasol y la mariposa monarca', 20.00, '15 x 20 cm',
        'Estructura pop-up central de alta precisión que recrea un gran girasol tridimensional en capas troqueladas y una mariposa monarca en relieve con alas desplegadas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000033-0000-0000-0000-000000000033', 'AMOR');
INSERT INTO tarjeta_categoria (tarjeta_id, category) VALUES ('a1000033-0000-0000-0000-000000000033', 'MEJORES_DESEOS');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000033-0000-0000-0000-000000000033', 'a1000033-0000-0000-0000-000000000033', 'COVER', 0, '/cards/33-0.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000033-0001-0000-0000-000000000033', 'a1000033-0000-0000-0000-000000000033', 'OPEN', 1, '/cards/33-1.webp');
INSERT INTO card_image (id, tarjeta_id, image_type, sort_order, url) VALUES ('c1000033-0002-0000-0000-000000000033', 'a1000033-0000-0000-0000-000000000033', 'ENVELOPE', 2, '/cards/33-2.webp');
