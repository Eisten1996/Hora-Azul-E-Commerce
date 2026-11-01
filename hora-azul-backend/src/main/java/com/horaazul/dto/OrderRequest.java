package com.horaazul.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * Cuerpo de la petición para crear una nueva orden de compra.
 *
 * <p>Todos los campos son obligatorios. Los ítems deben tener al menos uno;
 * cada ítem es validado de forma cascada mediante {@code @Valid}.</p>
 *
 * <p>Validates: Requirements 5.6, 5.7</p>
 *
 * @param customerName          nombre completo del cliente (máx 100 caracteres)
 * @param customerPhone         número de teléfono peruano de exactamente 9 dígitos
 * @param deliveryAddress       dirección de entrega (máx 200 caracteres)
 * @param estimatedDeliveryDate fecha estimada de entrega; debe ser hoy o futura
 * @param items                 lista de ítems del carrito; al menos uno requerido
 */
public record OrderRequest(
        @NotBlank @Size(max = 100)
        String customerName,

        @NotBlank
        @Pattern(regexp = "^\\d{9}$", message = "Ingresa un número de teléfono peruano válido de 9 dígitos.")
        String customerPhone,

        @NotBlank @Size(max = 200)
        String deliveryAddress,

        @NotNull @FutureOrPresent
        LocalDate estimatedDeliveryDate,

        @NotNull
        @Size(min = 1, message = "El carrito no puede estar vacío.")
        @Valid
        List<OrderRequestItem> items
) {}
