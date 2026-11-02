package com.horaazul.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa una tarjeta pop-up 3D del catálogo de Hora Azul.
 *
 * <p>El número de catálogo debe estar entre 1 y 33 (CHECK constraint a nivel de BD).
 * El precio debe ser uno de los valores permitidos: 15.00, 17.00, 20.00 o 30.00.</p>
 *
 * <p>Validates: Requirements 6.1, 6.5</p>
 */
@Entity
@Table(name = "tarjeta")
@Check(name = "chk_catalog_number_range", constraints = "catalog_number BETWEEN 1 AND 33")
@Check(name = "chk_price_values", constraints = "price IN (15.00, 17.00, 20.00, 30.00)")
public class Tarjeta extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(name = "catalog_number", unique = true, nullable = false)
    public Integer catalogNumber;

    @Column(nullable = false, length = 150)
    public String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public CardCategory category;

    @Column(nullable = false, precision = 7, scale = 2)
    public BigDecimal price;

    @Column(length = 50)
    public String dimensions;

    @Column(name = "description_3d", length = 300)
    public String description3d;

    @Column(name = "envelope_included", nullable = false)
    public Boolean envelopeIncluded = true;

    @Column(nullable = false)
    public Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tarjeta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<CardImage> images = new ArrayList<>();

    /**
     * Establece las marcas de tiempo antes de la primera persistencia.
     */
    @PrePersist
    void onPrePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Actualiza la marca de tiempo antes de cada actualización.
     */
    @PreUpdate
    void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
