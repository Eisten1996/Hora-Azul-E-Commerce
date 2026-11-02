package com.horaazul.dto;

import com.horaazul.model.CardImage;
import com.horaazul.model.ImageType;

/**
 * DTO que representa una imagen de tarjeta en las respuestas REST.
 *
 * <p>Validates: Requirements 3.2</p>
 *
 * @param url       URL pública de la imagen
 * @param imageType tipo de imagen (COVER, OPEN, ENVELOPE)
 * @param sortOrder orden de visualización dentro de la tarjeta
 */
public record CardImageDTO(
        String url,
        ImageType imageType,
        Integer sortOrder
) {
    /**
     * Crea un {@code CardImageDTO} a partir de la entidad {@link CardImage}.
     *
     * @param image entidad fuente
     * @return DTO mapeado
     */
    public static CardImageDTO from(CardImage image) {
        return new CardImageDTO(
                image.url,
                image.imageType,
                image.sortOrder
        );
    }
}
