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
 * <p>Stub mínimo para permitir la compilación de la entidad {@link Tarjeta}.
 * La implementación completa se realiza en la tarea 2.3.</p>
 *
 * <p>Validates: Requirements 6.1, 6.5</p>
 */
@Entity
@Table(name = "card_image")
public class CardImage extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ImageType imageType;

    @Column(name = "image_url", nullable = false, length = 500)
    public String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarjeta_id", nullable = false)
    public Tarjeta tarjeta;
}
