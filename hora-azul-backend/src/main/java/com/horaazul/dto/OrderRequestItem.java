package com.horaazul.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Representa un ítem individual dentro de un {@link OrderRequest}.
 *
 * <p>Cada ítem especifica qué tarjeta se desea comprar y en qué cantidad.
 * La resolución de la tarjeta (precio, nombre, número de catálogo) se realiza
 * en {@code OrderService} al momento de crear la orden.</p>
 *
 * <p>Validates: Requirements 5.6, 7.1</p>
 *
 * @param tarjetaId UUID de la tarjeta a comprar; debe existir en el catálogo
 * @param quantity  cantidad deseada; mínimo 1, máximo 99
 */
public record OrderRequestItem(
        @NotNull UUID tarjetaId,
        @Min(1) @Max(99) int quantity
) {}
