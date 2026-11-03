-- =============================================================================
-- Hora Azul — Esquema inicial
-- Compatible con PostgreSQL (Neon, producción) y H2 (dev/test).
-- Debe coincidir con las entidades JPA: Hibernate lo valida al arrancar.
-- =============================================================================

CREATE TABLE tarjeta (
    id                UUID          NOT NULL PRIMARY KEY,
    catalog_number    INTEGER       NOT NULL,
    name              VARCHAR(150)  NOT NULL,
    price             NUMERIC(7, 2) NOT NULL,
    dimensions        VARCHAR(50),
    description_3d    VARCHAR(300),
    envelope_included BOOLEAN       NOT NULL,
    active            BOOLEAN       NOT NULL,
    created_at        TIMESTAMP     NOT NULL,
    updated_at        TIMESTAMP     NOT NULL,
    CONSTRAINT uk_tarjeta_catalog_number UNIQUE (catalog_number),
    CONSTRAINT chk_catalog_number_range CHECK (catalog_number BETWEEN 1 AND 33),
    CONSTRAINT chk_price_values CHECK (price IN (15.00, 17.00, 20.00, 30.00))
);

-- Una tarjeta puede estar en varias categorías
CREATE TABLE tarjeta_categoria (
    tarjeta_id UUID        NOT NULL,
    category   VARCHAR(30) NOT NULL,
    CONSTRAINT pk_tarjeta_categoria PRIMARY KEY (tarjeta_id, category),
    CONSTRAINT fk_tarjeta_categoria_tarjeta FOREIGN KEY (tarjeta_id) REFERENCES tarjeta (id) ON DELETE CASCADE
);

CREATE TABLE card_image (
    id         UUID         NOT NULL PRIMARY KEY,
    tarjeta_id UUID         NOT NULL,
    url        VARCHAR(500) NOT NULL,
    sort_order INTEGER      NOT NULL,
    image_type VARCHAR(20)  NOT NULL,
    CONSTRAINT fk_card_image_tarjeta FOREIGN KEY (tarjeta_id) REFERENCES tarjeta (id) ON DELETE CASCADE
);
CREATE INDEX idx_card_image_tarjeta ON card_image (tarjeta_id);

CREATE TABLE orden (
    id                      UUID         NOT NULL PRIMARY KEY,
    order_code              VARCHAR(20)  NOT NULL,
    status                  VARCHAR(30)  NOT NULL,
    customer_name           VARCHAR(100) NOT NULL,
    customer_phone          VARCHAR(9)   NOT NULL,
    delivery_address        VARCHAR(200) NOT NULL,
    estimated_delivery_date DATE         NOT NULL,
    created_at              TIMESTAMP    NOT NULL,
    CONSTRAINT uk_orden_order_code UNIQUE (order_code)
);

-- tarjeta_id es opcional: la orden conserva una copia de los datos de la tarjeta
CREATE TABLE orden_item (
    id             UUID          NOT NULL PRIMARY KEY,
    orden_id       UUID          NOT NULL,
    tarjeta_id     UUID,
    catalog_number INTEGER       NOT NULL,
    card_name      VARCHAR(150)  NOT NULL,
    unit_price     NUMERIC(7, 2) NOT NULL,
    quantity       INTEGER       NOT NULL,
    CONSTRAINT fk_orden_item_orden FOREIGN KEY (orden_id) REFERENCES orden (id),
    CONSTRAINT fk_orden_item_tarjeta FOREIGN KEY (tarjeta_id) REFERENCES tarjeta (id) ON DELETE SET NULL,
    CONSTRAINT chk_quantity_range CHECK (quantity BETWEEN 1 AND 99)
);
CREATE INDEX idx_orden_item_orden ON orden_item (orden_id);
