package com.horaazul.dto;

import com.horaazul.model.CardCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * DTO para la actualización de una tarjeta existente.
 *
 * <p>El {@code catalogNumber} es inmutable y no se incluye en este DTO.
 * Todos los demás campos son actualizables.</p>
 *
 * <p>Validates: Requirements 6.2, 6.3, 11.10</p>
 *
 * @param name          nombre de la tarjeta
 * @param categories    categorías temáticas (al menos una)
 * @param price         precio (debe ser 15, 17, 20 o 30)
 * @param dimensions    dimensiones opcionales
 * @param description3d descripción del efecto 3D (opcional)
 * @param envelopeIncluded si incluye sobre
 * @param images        lista de hasta 10 imágenes (reemplaza las existentes si no es nula)
 */
public record TarjetaUpdateRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
        String name,

        @NotEmpty(message = "Indica al menos una categoría")
        Set<@NotNull CardCategory> categories,

        @NotNull(message = "El precio es obligatorio")
        BigDecimal price,

        @Size(max = 50, message = "Las dimensiones no pueden superar 50 caracteres")
        String dimensions,

        @Size(max = 300, message = "La descripción 3D no puede superar 300 caracteres")
        String description3d,

        @NotNull(message = "El campo envelopeIncluded es obligatorio")
        Boolean envelopeIncluded,

        @Size(max = 10, message = "Una tarjeta admite como máximo 10 imágenes")
        @Valid
        List<ImageRequest> images
) {}
