package com.horaazul.dto;

import com.horaazul.model.CardCategory;
import com.horaazul.model.Tarjeta;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Fila del listado de tarjetas del panel administrativo.
 *
 * <p>Validates: Requirements 11.1, 11.3</p>
 *
 * @param id            UUID de la tarjeta
 * @param catalogNumber número de catálogo
 * @param name          nombre de la tarjeta
 * @param categories    categorías temáticas (en el orden del enum)
 * @param price         precio en soles peruanos
 * @param coverImageUrl URL de la portada, o {@code null} si no tiene imágenes
 * @param active        si la tarjeta se muestra en el catálogo público
 */
public record AdminCardDTO(
        UUID id,
        Integer catalogNumber,
        String name,
        List<CardCategory> categories,
        BigDecimal price,
        String coverImageUrl,
        boolean active
) {
    /**
     * Crea el DTO a partir de la entidad.
     *
     * @param tarjeta entidad fuente (las imágenes deben estar inicializadas)
     * @return DTO mapeado
     */
    public static AdminCardDTO from(Tarjeta tarjeta) {
        return new AdminCardDTO(
                tarjeta.id,
                tarjeta.catalogNumber,
                tarjeta.name,
                tarjeta.sortedCategories(),
                tarjeta.price,
                CardSummaryDTO.from(tarjeta).coverImageUrl(),
                tarjeta.active
        );
    }
}
