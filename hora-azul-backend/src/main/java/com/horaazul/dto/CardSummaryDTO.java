package com.horaazul.dto;

import com.horaazul.model.CardCategory;
import com.horaazul.model.ImageType;
import com.horaazul.model.Tarjeta;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.UUID;

/**
 * DTO de resumen de tarjeta para el listado del catálogo.
 *
 * <p>Incluye la URL de la imagen de portada ({@link ImageType#COVER}), o la
 * primera imagen por {@code sortOrder} si no existe ninguna de tipo COVER.</p>
 *
 * <p>Validates: Requirements 1.2, 1.3, 6.4, 6.5</p>
 *
 * @param id               UUID de la tarjeta
 * @param catalogNumber    número de catálogo (1–33)
 * @param name             nombre de la tarjeta
 * @param category         categoría temática
 * @param price            precio en soles peruanos
 * @param dimensions       dimensiones físicas (p. ej. "15cm × 10cm")
 * @param description3d    descripción del efecto pop-up 3D
 * @param envelopeIncluded indica si se incluye sobre
 * @param coverImageUrl    URL de la imagen de portada (o primera imagen disponible)
 */
public record CardSummaryDTO(
        UUID id,
        Integer catalogNumber,
        String name,
        CardCategory category,
        BigDecimal price,
        String dimensions,
        String description3d,
        Boolean envelopeIncluded,
        String coverImageUrl
) {
    /**
     * Crea un {@code CardSummaryDTO} a partir de la entidad {@link Tarjeta}.
     *
     * <p>La URL de portada se obtiene buscando la primera imagen con
     * {@code imageType == COVER}; si no hay ninguna, se usa la imagen con
     * el menor {@code sortOrder}.</p>
     *
     * @param tarjeta entidad fuente (imágenes deben estar inicializadas)
     * @return DTO mapeado
     */
    public static CardSummaryDTO from(Tarjeta tarjeta) {
        String coverUrl = tarjeta.images.stream()
                .filter(img -> ImageType.COVER.equals(img.imageType))
                .findFirst()
                .map(img -> img.url)
                .orElseGet(() -> tarjeta.images.stream()
                        .min(Comparator.comparingInt(img -> img.sortOrder))
                        .map(img -> img.url)
                        .orElse(null));

        return new CardSummaryDTO(
                tarjeta.id,
                tarjeta.catalogNumber,
                tarjeta.name,
                tarjeta.category,
                tarjeta.price,
                tarjeta.dimensions,
                tarjeta.description3d,
                tarjeta.envelopeIncluded,
                coverUrl
        );
    }
}
