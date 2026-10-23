-- =============================================================================
-- Hora Azul — Datos semilla del catálogo de tarjetas pop-up 3D
-- 33 tarjetas con distribución en 6 categorías y 4 niveles de precio
-- Ejecutado automáticamente por Hibernate (drop-and-create) en perfil dev/test
-- Sintaxis compatible con H2 y PostgreSQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CATEGORÍA: CUMPLEANOS (tarjetas 1–8)
-- -----------------------------------------------------------------------------

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000001-0000-0000-0000-000000000001', 1, 'Globos de Cumpleaños', 'CUMPLEANOS', 15.00, '15 x 20 cm',
        'Al abrir la tarjeta emergen tres globos de colores con efecto 3D que se elevan del centro de la hoja.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000002-0000-0000-0000-000000000002', 2, 'Torta con Velas', 'CUMPLEANOS', 17.00, '15 x 20 cm',
        'Una torta de cumpleaños de tres pisos con velas encendidas emerge en relieve al desplegar la tarjeta.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000003-0000-0000-0000-000000000003', 3, 'Mariposas de Fiesta', 'CUMPLEANOS', 20.00, '15 x 20 cm',
        'Un jardín de mariposas coloridas despliega sus alas en 3D cuando la tarjeta es abierta por el destinatario.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000004-0000-0000-0000-000000000004', 4, 'Cohetes y Estrellas', 'CUMPLEANOS', 30.00, '20 x 25 cm',
        'Cohetes de colores y estrellas brillantes surgen en relieve triple al abrir, creando un efecto festivo espectacular.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000005-0000-0000-0000-000000000005', 5, 'Confeti y Serpentinas', 'CUMPLEANOS', 15.00, '15 x 20 cm',
        'Serpentinas y confeti en espiral emergen en 3D al abrir, reproduciendo la alegría de una celebración.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000006-0000-0000-0000-000000000006', 6, 'Corona de Cumpleaños', 'CUMPLEANOS', 17.00, '15 x 20 cm',
        'Una corona dorada con gemas de colores se yergue en el centro al desplegar la tarjeta, lista para coronar al festejado.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000007-0000-0000-0000-000000000007', 7, 'Oso de Peluche Festivo', 'CUMPLEANOS', 20.00, '15 x 20 cm',
        'Un tierno oso de peluche sosteniendo un globo emerge en tres dimensiones al abrir la tarjeta.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('a1000008-0000-0000-0000-000000000008', 8, 'Arco Iris de Celebración', 'CUMPLEANOS', 30.00, '20 x 25 cm',
        'Un magnífico arco iris con nubes y estrellas doradas surge en relieve al desplegar, llenando de color el momento.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------
-- CATEGORÍA: FLORES (tarjetas 9–14)
-- -----------------------------------------------------------------------------

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('b2000001-0000-0000-0000-000000000009', 9, 'Ramo de Rosas Rojas', 'FLORES', 15.00, '15 x 20 cm',
        'Un ramo de rosas rojas en plena floración emerge en 3D al abrir, transmitiendo elegancia y delicadeza.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('b2000002-0000-0000-0000-000000000010', 10, 'Jardín de Tulipanes', 'FLORES', 17.00, '15 x 20 cm',
        'Tulipanes de vivos colores crecen desde la base de la tarjeta en un jardín pop-up lleno de vida y color.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('b2000003-0000-0000-0000-000000000011', 11, 'Girasoles Radiantes', 'FLORES', 20.00, '15 x 20 cm',
        'Girasoles de gran tamaño se alzan en tres dimensiones al abrir la tarjeta, irradiando calidez y alegría natural.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('b2000004-0000-0000-0000-000000000012', 12, 'Lirios de Primavera', 'FLORES', 30.00, '20 x 25 cm',
        'Tres niveles de lirios blancos y violetas se despliegan en elaborado relieve al abrir, creando una escena floral sublime.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('b2000005-0000-0000-0000-000000000013', 13, 'Peonías en Flor', 'FLORES', 17.00, '15 x 20 cm',
        'Peonías de pétalos mullidos y rosados emergen en 3D al desplegar, evocando la elegancia del jardín botánico.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('b2000006-0000-0000-0000-000000000014', 14, 'Orquídeas Exóticas', 'FLORES', 20.00, '15 x 20 cm',
        'Dos orquídeas exóticas de colores vivos surgen en relieve al abrir la tarjeta, simbolizando belleza y distinción.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------
-- CATEGORÍA: AMOR (tarjetas 15–19)
-- -----------------------------------------------------------------------------

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('c3000001-0000-0000-0000-000000000015', 15, 'Corazón Entrelazado', 'AMOR', 15.00, '15 x 20 cm',
        'Dos corazones entrelazados emergen en 3D al abrir la tarjeta, representando la unión de dos almas enamoradas.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('c3000002-0000-0000-0000-000000000016', 16, 'Lluvia de Corazones', 'AMOR', 17.00, '15 x 20 cm',
        'Una cascada de corazones de distintos tamaños cae en 3D al desplegar la tarjeta, llenando de amor cada centímetro.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('c3000003-0000-0000-0000-000000000017', 17, 'Rosas y Corazón', 'AMOR', 20.00, '15 x 20 cm',
        'Un corazón enmarcado por rosas rojas en relieve emerge al abrir, perfecta declaración de amor en papel artesanal.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('c3000004-0000-0000-0000-000000000018', 18, 'Cupido y Flechas', 'AMOR', 30.00, '20 x 25 cm',
        'Un cupido con arco y flechas doradas surge en elaborado pop-up de tres capas al abrir, con destellos metalizados.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('c3000005-0000-0000-0000-000000000019', 19, 'Castillo de Ensueño', 'AMOR', 20.00, '15 x 20 cm',
        'Un castillo de cuento de hadas emerge en 3D al abrir la tarjeta, evocando la magia de un amor de película.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------
-- CATEGORÍA: SIN_MENSAJE (tarjetas 20–24)
-- -----------------------------------------------------------------------------

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('d4000001-0000-0000-0000-000000000020', 20, 'Mariposas Silvestres', 'SIN_MENSAJE', 15.00, '15 x 20 cm',
        'Tres mariposas de diferentes especies emergen en relieve al abrir, perfectas para cualquier ocasión o mensaje personal.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('d4000002-0000-0000-0000-000000000021', 21, 'Árbol de la Vida', 'SIN_MENSAJE', 17.00, '15 x 20 cm',
        'Un frondoso árbol con hojas de colores se despliega en 3D al abrir la tarjeta, símbolo atemporal de vida y crecimiento.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('d4000003-0000-0000-0000-000000000022', 22, 'Paisaje de Montaña', 'SIN_MENSAJE', 20.00, '15 x 20 cm',
        'Un sereno paisaje de montañas con lago emerge en múltiples planos 3D al desplegar, ideal para cualquier mensaje.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('d4000004-0000-0000-0000-000000000023', 23, 'Barco Velero', 'SIN_MENSAJE', 30.00, '20 x 25 cm',
        'Un velero en alta mar emerge en detallado relieve de tres niveles al abrir, con olas y gaviotas incluidas en el diseño.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('d4000005-0000-0000-0000-000000000024', 24, 'Ciudad al Atardecer', 'SIN_MENSAJE', 17.00, '15 x 20 cm',
        'Una silueta de ciudad iluminada al atardecer surge en 3D al desplegar, evocando nostalgia y serenidad urbana.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------
-- CATEGORÍA: MEJORES_DESEOS (tarjetas 25–29)
-- -----------------------------------------------------------------------------

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('e5000001-0000-0000-0000-000000000025', 25, 'Estrellas de Buena Suerte', 'MEJORES_DESEOS', 15.00, '15 x 20 cm',
        'Un conjunto de estrellas doradas de distintos tamaños emerge en relieve al abrir, portando deseos de buena fortuna.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('e5000002-0000-0000-0000-000000000026', 26, 'Trébol de la Suerte', 'MEJORES_DESEOS', 17.00, '15 x 20 cm',
        'Un gran trébol de cuatro hojas en 3D aparece al abrir la tarjeta, trayendo buena suerte y deseos positivos al destinatario.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('e5000003-0000-0000-0000-000000000027', 27, 'Palomas en Vuelo', 'MEJORES_DESEOS', 20.00, '15 x 20 cm',
        'Tres palomas blancas despegan en relieve 3D al abrir la tarjeta, simbolizando paz, esperanza y nuevos comienzos.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('e5000004-0000-0000-0000-000000000028', 28, 'Arco Iris de Esperanza', 'MEJORES_DESEOS', 30.00, '20 x 25 cm',
        'Un arco iris de cinco capas surge en pop-up multicapa al abrir, con nubes blancas y detalles dorados que transmiten esperanza.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('e5000005-0000-0000-0000-000000000029', 29, 'Farolillos de Luz', 'MEJORES_DESEOS', 15.00, '15 x 20 cm',
        'Farolillos de papel flotando en el cielo emergen en 3D al abrir, evocando la belleza de los deseos lanzados al aire.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- -----------------------------------------------------------------------------
-- CATEGORÍA: AGRADECIMIENTO (tarjetas 30–33)
-- -----------------------------------------------------------------------------

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('f6000001-0000-0000-0000-000000000030', 30, 'Flores de Gratitud', 'AGRADECIMIENTO', 15.00, '15 x 20 cm',
        'Un ramo de flores coloridas en 3D emerge al abrir la tarjeta, expresando gratitud de la manera más delicada.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('f6000002-0000-0000-0000-000000000031', 31, 'Mariposa de las Gracias', 'AGRADECIMIENTO', 17.00, '15 x 20 cm',
        'Una hermosa mariposa monarca surge en relieve al desplegar la tarjeta, símbolo perfecto de transformación y agradecimiento.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('f6000003-0000-0000-0000-000000000032', 32, 'Sol Radiante', 'AGRADECIMIENTO', 20.00, '15 x 20 cm',
        'Un sol con rayos detallados emerge en 3D al abrir la tarjeta, irradiando calidez y gratitud hacia quien la recibe.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tarjeta (id, catalog_number, name, category, price, dimensions, description_3d, envelope_included, active, created_at, updated_at)
VALUES ('f6000004-0000-0000-0000-000000000033', 33, 'Jardín de Agradecimiento', 'AGRADECIMIENTO', 30.00, '20 x 25 cm',
        'Un jardín completo con flores, mariposas y una fuente emerge en elaborado relieve de cuatro capas al abrir, transmitiendo gratitud profunda.',
        TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- IMÁGENES DE PORTADA (COVER) — una por cada tarjeta
-- URLs de placeholder que serán reemplazadas con imágenes reales en producción
-- =============================================================================

-- CUMPLEANOS
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'COVER', 'https://placehold.co/600x400?text=Globos+de+Cumpleanos');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00002-0000-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', 'COVER', 'https://placehold.co/600x400?text=Torta+con+Velas');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00003-0000-0000-0000-000000000003', 'a1000003-0000-0000-0000-000000000003', 'COVER', 'https://placehold.co/600x400?text=Mariposas+de+Fiesta');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00004-0000-0000-0000-000000000004', 'a1000004-0000-0000-0000-000000000004', 'COVER', 'https://placehold.co/600x400?text=Cohetes+y+Estrellas');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00005-0000-0000-0000-000000000005', 'a1000005-0000-0000-0000-000000000005', 'COVER', 'https://placehold.co/600x400?text=Confeti+y+Serpentinas');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00006-0000-0000-0000-000000000006', 'a1000006-0000-0000-0000-000000000006', 'COVER', 'https://placehold.co/600x400?text=Corona+de+Cumpleanos');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00007-0000-0000-0000-000000000007', 'a1000007-0000-0000-0000-000000000007', 'COVER', 'https://placehold.co/600x400?text=Oso+de+Peluche+Festivo');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00008-0000-0000-0000-000000000008', 'a1000008-0000-0000-0000-000000000008', 'COVER', 'https://placehold.co/600x400?text=Arco+Iris+de+Celebracion');

-- FLORES
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00009-0000-0000-0000-000000000009', 'b2000001-0000-0000-0000-000000000009', 'COVER', 'https://placehold.co/600x400?text=Ramo+de+Rosas+Rojas');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00010-0000-0000-0000-000000000010', 'b2000002-0000-0000-0000-000000000010', 'COVER', 'https://placehold.co/600x400?text=Jardin+de+Tulipanes');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00011-0000-0000-0000-000000000011', 'b2000003-0000-0000-0000-000000000011', 'COVER', 'https://placehold.co/600x400?text=Girasoles+Radiantes');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00012-0000-0000-0000-000000000012', 'b2000004-0000-0000-0000-000000000012', 'COVER', 'https://placehold.co/600x400?text=Lirios+de+Primavera');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00013-0000-0000-0000-000000000013', 'b2000005-0000-0000-0000-000000000013', 'COVER', 'https://placehold.co/600x400?text=Peonias+en+Flor');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00014-0000-0000-0000-000000000014', 'b2000006-0000-0000-0000-000000000014', 'COVER', 'https://placehold.co/600x400?text=Orquideas+Exoticas');

-- AMOR
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00015-0000-0000-0000-000000000015', 'c3000001-0000-0000-0000-000000000015', 'COVER', 'https://placehold.co/600x400?text=Corazon+Entrelazado');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00016-0000-0000-0000-000000000016', 'c3000002-0000-0000-0000-000000000016', 'COVER', 'https://placehold.co/600x400?text=Lluvia+de+Corazones');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00017-0000-0000-0000-000000000017', 'c3000003-0000-0000-0000-000000000017', 'COVER', 'https://placehold.co/600x400?text=Rosas+y+Corazon');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00018-0000-0000-0000-000000000018', 'c3000004-0000-0000-0000-000000000018', 'COVER', 'https://placehold.co/600x400?text=Cupido+y+Flechas');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00019-0000-0000-0000-000000000019', 'c3000005-0000-0000-0000-000000000019', 'COVER', 'https://placehold.co/600x400?text=Castillo+de+Ensueno');

-- SIN_MENSAJE
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00020-0000-0000-0000-000000000020', 'd4000001-0000-0000-0000-000000000020', 'COVER', 'https://placehold.co/600x400?text=Mariposas+Silvestres');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00021-0000-0000-0000-000000000021', 'd4000002-0000-0000-0000-000000000021', 'COVER', 'https://placehold.co/600x400?text=Arbol+de+la+Vida');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00022-0000-0000-0000-000000000022', 'd4000003-0000-0000-0000-000000000022', 'COVER', 'https://placehold.co/600x400?text=Paisaje+de+Montana');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00023-0000-0000-0000-000000000023', 'd4000004-0000-0000-0000-000000000023', 'COVER', 'https://placehold.co/600x400?text=Barco+Velero');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00024-0000-0000-0000-000000000024', 'd4000005-0000-0000-0000-000000000024', 'COVER', 'https://placehold.co/600x400?text=Ciudad+al+Atardecer');

-- MEJORES_DESEOS
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00025-0000-0000-0000-000000000025', 'e5000001-0000-0000-0000-000000000025', 'COVER', 'https://placehold.co/600x400?text=Estrellas+de+Buena+Suerte');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00026-0000-0000-0000-000000000026', 'e5000002-0000-0000-0000-000000000026', 'COVER', 'https://placehold.co/600x400?text=Trebol+de+la+Suerte');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00027-0000-0000-0000-000000000027', 'e5000003-0000-0000-0000-000000000027', 'COVER', 'https://placehold.co/600x400?text=Palomas+en+Vuelo');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00028-0000-0000-0000-000000000028', 'e5000004-0000-0000-0000-000000000028', 'COVER', 'https://placehold.co/600x400?text=Arco+Iris+de+Esperanza');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00029-0000-0000-0000-000000000029', 'e5000005-0000-0000-0000-000000000029', 'COVER', 'https://placehold.co/600x400?text=Farolillos+de+Luz');

-- AGRADECIMIENTO
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00030-0000-0000-0000-000000000030', 'f6000001-0000-0000-0000-000000000030', 'COVER', 'https://placehold.co/600x400?text=Flores+de+Gratitud');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00031-0000-0000-0000-000000000031', 'f6000002-0000-0000-0000-000000000031', 'COVER', 'https://placehold.co/600x400?text=Mariposa+de+las+Gracias');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00032-0000-0000-0000-000000000032', 'f6000003-0000-0000-0000-000000000032', 'COVER', 'https://placehold.co/600x400?text=Sol+Radiante');
INSERT INTO card_image (id, tarjeta_id, image_type, image_url) VALUES ('img00033-0000-0000-0000-000000000033', 'f6000004-0000-0000-0000-000000000033', 'COVER', 'https://placehold.co/600x400?text=Jardin+de+Agradecimiento');
