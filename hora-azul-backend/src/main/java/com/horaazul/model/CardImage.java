package com.horaazul.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Imagen asociada a una tarjeta pop-up 3D.
 *
 * <p>Una tarjeta puede tener múltiples imágenes de distintos tipos (portada,
 * desplegada, sobre). El campo {@code sortOrder} determina el orden de
 * visualización dentro de cada tarjeta.</p>
 *
 * <p>Validates: Requirements 3.2</p>
 */
@Entity
@Table(name = "card_image")
public class CardImage extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarjeta_id", nullable = false)
    public Tarjeta tarjeta;

    @Column(nullable = false, length = 500)
    public String url;

    @Column(name = "sort_order", nullable = false)
    public Integer sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", nullable = false)
    public ImageType imageType;
}
