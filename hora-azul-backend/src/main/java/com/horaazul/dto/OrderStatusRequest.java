package com.horaazul.dto;

import com.horaazul.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Cuerpo de {@code PATCH /api/orders/{orderCode}/status}.
 *
 * @param status estado al que se quiere pasar la orden
 */
public record OrderStatusRequest(@NotNull OrderStatus status) {
}
