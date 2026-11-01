package com.horaazul.dto;

import com.horaazul.model.Orden;
import com.horaazul.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Resumen de una orden para el listado de administración.
 *
 * <p>Incluye los datos esenciales de la orden sin el detalle completo de ítems.
 * El {@code totalAmount} se calcula sumando {@code unitPrice × quantity} de todos
 * los ítems de la orden.</p>
 *
 * <p>Validates: Requirements 7.2</p>
 *
 * @param orderCode    código único de la orden en formato {@code ORD-YYYY-XXXX}
 * @param customerName nombre del cliente
 * @param totalAmount  suma de todos los subtotales ({@code unitPrice × quantity})
 * @param status       estado actual de la orden
 * @param createdAt    marca de tiempo de creación
 */
public record OrderSummaryDTO(
        String orderCode,
        String customerName,
        BigDecimal totalAmount,
        OrderStatus status,
        LocalDateTime createdAt
) {

    /**
     * Construye un {@code OrderSummaryDTO} a partir de la entidad {@link Orden}.
     *
     * <p>Calcula el {@code totalAmount} iterando sobre los ítems de la orden.</p>
     *
     * @param orden entidad fuente con su colección de ítems cargada
     * @return DTO de resumen con el total calculado
     */
    public static OrderSummaryDTO from(Orden orden) {
        BigDecimal totalAmount = orden.items.stream()
                .map(item -> item.unitPrice.multiply(BigDecimal.valueOf(item.quantity)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderSummaryDTO(
                orden.orderCode,
                orden.customerName,
                totalAmount,
                orden.status,
                orden.createdAt
        );
    }
}
