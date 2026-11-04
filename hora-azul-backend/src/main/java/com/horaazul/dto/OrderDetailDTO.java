package com.horaazul.dto;

import com.horaazul.model.Orden;
import com.horaazul.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Detalle completo de una orden para el panel.
 *
 * <p>Añade a {@link OrderResponse} los datos de contacto y entrega, que la respuesta
 * pública de creación no expone.</p>
 *
 * <p>Validates: Requirements 12.3, 12.10</p>
 *
 * @param orderCode             código único en formato {@code ORD-YYYY-XXXX}
 * @param status                estado actual
 * @param customerName          nombre del cliente
 * @param customerPhone         teléfono del cliente
 * @param deliveryAddress       punto de entrega
 * @param estimatedDeliveryDate fecha estimada de entrega
 * @param totalAmount           suma de los subtotales
 * @param items                 ítems con el precio del momento de la compra
 * @param createdAt             fecha de creación
 */
public record OrderDetailDTO(
        String orderCode,
        OrderStatus status,
        String customerName,
        String customerPhone,
        String deliveryAddress,
        LocalDate estimatedDeliveryDate,
        BigDecimal totalAmount,
        List<OrderItemDTO> items,
        LocalDateTime createdAt
) {

    /**
     * Construye el detalle desde la entidad. La colección {@code items} debe poder
     * cargarse, es decir, hay que llamarlo dentro de una transacción.
     *
     * @param orden entidad fuente
     * @return detalle con el total calculado
     */
    public static OrderDetailDTO from(Orden orden) {
        List<OrderItemDTO> items = orden.items.stream()
                .map(OrderItemDTO::from)
                .toList();

        BigDecimal totalAmount = items.stream()
                .map(OrderItemDTO::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderDetailDTO(
                orden.orderCode,
                orden.status,
                orden.customerName,
                orden.customerPhone,
                orden.deliveryAddress,
                orden.estimatedDeliveryDate,
                totalAmount,
                items,
                orden.createdAt
        );
    }
}
