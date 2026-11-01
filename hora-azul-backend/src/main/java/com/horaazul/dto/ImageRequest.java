package com.horaazul.dto;

import com.horaazul.model.ImageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear o actualizar una imagen de una tarjeta.
 *
 * <p>Validates: Requirements 3.2, 6.1</p>
 *
 * @param url       URL de la imagen (máx 500 caracteres, requerida)
 * @param sortOrder orden de visualización (default 0)
 * @param imageType tipo de imagen (COVER, OPEN, ENVELOPE)
 */
public record ImageRequest(

        @NotBlank(message = "La URL de la imagen es obligatoria")
        @Size(max = 500, message = "La URL no puede superar 500 caracteres")
        String url,

        Integer sortOrder,

        @NotNull(message = "El tipo de imagen es obligatorio")
        ImageType imageType
) {
    /** Normaliza {@code sortOrder} a 0 si viene nulo. */
    public ImageRequest {
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
}
