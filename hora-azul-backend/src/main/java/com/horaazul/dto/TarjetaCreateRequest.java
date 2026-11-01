package com.horaazul.dto;

import com.horaazul.model.CardCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para la creación de una nueva tarjeta pop-up 3D.
 *
 * <p>La validación de que el precio pertenece a {15.00, 17.00, 20.00, 30.00}
 * se realiza en {@code TarjetaService}, no como Bean Validation,
 * porque requiere lógica de conjunto que no se expresa limpiamente con anotaciones.</p>
 *
 * <p>Validates: Requirements 6.1, 6.2</p>
 *
 * @param catalogNumber número de catálogo entre 1 y 33 (único)
 * @param name          nombre de la tarjeta
 * @param category      categoría temática
 * @param price         precio (debe ser 15, 17, 20 o 30)
 * @param dimensions    dimensiones opcionales (ej. "15cm x 10cm")
 * @param description3d descripción del efecto 3D (opcional)
 * @param envelopeIncluded si incluye sobre (default true)
 * @param images        lista de imágenes asociadas
 */
public record TarjetaCreateRequest(

        @NotNull(message = "El número de catálogo es obligatorio")
        @Min(value = 1, message = "El número de catálogo debe ser al menos 1")
        @Max(value = 33, message = "El número de catálogo no puede superar 33")
        Integer catalogNumber,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
        String name,

        @NotNull(message = "La categoría es obligatoria")
        CardCategory category,

        @NotNull(message = "El precio es obligatorio")
        BigDecimal price,

        @Size(max = 50, message = "Las dimensiones no pueden superar 50 caracteres")
        String dimensions,

        @Size(max = 300, message = "La descripción 3D no puede superar 300 caracteres")
        String description3d,

        @NotNull(message = "El campo envelopeIncluded es obligatorio")
        Boolean envelopeIncluded,

        @NotNull(message = "La lista de imágenes es obligatoria")
        @Valid
        List<ImageRequest> images
) {}
