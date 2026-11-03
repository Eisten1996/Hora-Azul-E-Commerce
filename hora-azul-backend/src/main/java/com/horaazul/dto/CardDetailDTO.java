package com.horaazul.dto;

import com.horaazul.model.CardCategory;
import com.horaazul.model.ImageType;
import com.horaazul.model.Tarjeta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * DTO de detalle completo de una tarjeta para el endpoint {@code GET /api/cards/{id}}.
 *
 * <p>Incluye todos los campos de {@link CardSummaryDTO} más los campos de auditoría,
 * el indicador {@code active} y la lista completa de imágenes.</p>
 *
 * <p>Validates: Requirements 3.2, 6.5</p>
 *
 * @param id               UUID de la tarjeta
 * @param catalogNumber    número de catálogo (1–33)
 * @param name             nombre de la tarjeta
 * @param categories       categorías temáticas (en el orden del enum)
 * @param price            precio en soles peruanos
 * @param dimensions       dimensiones físicas
 * @param description3d    descripción del efecto pop-up 3D
 * @param envelopeIncluded indica si se incluye sobre
 * @param coverImageUrl    URL de la imagen de portada (o primera disponible)
 * @param active           indica si la tarjeta está activa en el catálogo
 * @param images           lista completa de imágenes ordenadas por {@code sortOrder}
 * @param createdAt        marca de tiempo de creación
 * @param updatedAt        marca de tiempo de última actualización
 */
public record CardDetailDTO(
        UUID id,
        Integer catalogNumber,
        String name,
        List<CardCategory> categories,
        BigDecimal price,
        String dimensions,
        String description3d,
        Boolean envelopeIncluded,
        String coverImageUrl,
        Boolean active,
        List<CardImageDTO> images,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Crea un {@code CardDetailDTO} a partir de la entidad {@link Tarjeta}.
     *
     * <p>Las imágenes se ordenan por {@code sortOrder} ascendente.
     * La URL de portada usa la misma lógica que {@link CardSummaryDTO#from(Tarjeta)}.</p>
     *
     * @param tarjeta entidad fuente (imágenes deben estar inicializadas)
     * @return DTO mapeado
     */
    public static CardDetailDTO from(Tarjeta tarjeta) {
        String coverUrl = tarjeta.images.stream()
                .filter(img -> ImageType.COVER.equals(img.imageType))
                .findFirst()
                .map(img -> img.url)
                .orElseGet(() -> tarjeta.images.stream()
                        .min(Comparator.comparingInt(img -> img.sortOrder))
                        .map(img -> img.url)
                        .orElse(null));

        List<CardImageDTO> imageDTOs = tarjeta.images.stream()
                .sorted(Comparator.comparingInt(img -> img.sortOrder))
                .map(CardImageDTO::from)
                .toList();

        return new CardDetailDTO(
                tarjeta.id,
                tarjeta.catalogNumber,
                tarjeta.name,
                tarjeta.sortedCategories(),
                tarjeta.price,
                tarjeta.dimensions,
                tarjeta.description3d,
                tarjeta.envelopeIncluded,
                coverUrl,
                tarjeta.active,
                imageDTOs,
                tarjeta.createdAt,
                tarjeta.updatedAt
        );
    }
}
