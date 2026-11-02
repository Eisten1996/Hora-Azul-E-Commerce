package com.horaazul.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Ítem de una orden de compra en Hora Azul.
 *
 * <p>Cada ítem referencia la tarjeta comprada e incluye una copia de los datos
 * relevantes (número de catálogo, nombre y precio unitario) para preservar el
 * histórico aunque la tarjeta sea modificada posteriormente.</p>
 *
 * <p>La FK {@code tarjeta_id} es nullable: si una tarjeta es eliminada del catálogo,
 * la orden ya creada debe preservarse con los datos históricos copiados en
 * {@code catalogNumber}, {@code cardName} y {@code unitPrice}.</p>
 *
 * <p>Validates: Requirements 7.1</p>
 */
@Entity
@Table(name = "orden_item")
@Check(name = "chk_quantity_range", constraints = "quantity BETWEEN 1 AND 99")
public class OrdenItem extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id", nullable = false)
    public Orden orden;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "tarjeta_id")
    public Tarjeta tarjeta;

    @Column(name = "catalog_number", nullable = false)
    public Integer catalogNumber;

    @Column(name = "card_name", nullable = false, length = 150)
    public String cardName;

    @Column(name = "unit_price", nullable = false, precision = 7, scale = 2)
    public BigDecimal unitPrice;

    @Column(nullable = false)
    public Integer quantity;
}
