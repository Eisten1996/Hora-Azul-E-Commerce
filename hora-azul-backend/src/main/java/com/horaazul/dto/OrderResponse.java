package com.horaazul.dto;

import com.horaazul.model.Orden;
import com.horaazul.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Respuesta devuelta al cliente tras la creación exitosa de una orden.
 *
 * <p>Incluye el código único generado, el estado inicial, los datos del cliente,
 * el importe total y el detalle de cada ítem comprado.</p>
 *
 * <p>Validates: Requirements 5.7, 7.1</p>
 *
 * @param orderCode    código único de la orden en formato {@code ORD-YYYY-XXXX}
 * @param status       estado inicial de la orden ({@code PENDING_PAYMENT})
 * @param customerName nombre del cliente
 * @param totalAmount  suma de todos los subtotales de los ítems
 * @param items        lista de ítems con precio, cantidad y subtotal por ítem
 * @param createdAt    marca de tiempo de creación de la orden
 */
public record OrderResponse(
        String orderCode,
        OrderStatus status,
        String customerName,
        BigDecimal totalAmount,
        List<OrderItemDTO> items,
        LocalDateTime createdAt
) {

    /**
     * Construye un {@code OrderResponse} a partir de la entidad {@link Orden}
     * y la lista de DTOs de ítems ya calculados.
     *
     * @param orden       entidad de la orden persistida
     * @param itemDTOs    lista de DTOs con subtotales calculados
     * @param totalAmount importe total de la orden
     * @return DTO de respuesta completo
     */
    public static OrderResponse from(Orden orden, List<OrderItemDTO> itemDTOs, BigDecimal totalAmount) {
        return new OrderResponse(
                orden.orderCode,
                orden.status,
                orden.customerName,
                totalAmount,
                itemDTOs,
                orden.createdAt
        );
    }

    /**
     * Construye un {@code OrderResponse} completo directamente desde la entidad {@link Orden},
     * mapeando cada ítem a {@link OrderItemDTO} y calculando el {@code totalAmount}.
     *
     * <p>Requiere que la colección {@code items} de la orden esté disponible (dentro de una
     * transacción activa o con fetch previo).</p>
     *
     * @param orden entidad con su colección de ítems accesible
     * @return DTO de respuesta completo con todos los ítems y el total calculado
     */
    public static OrderResponse fromEntity(Orden orden) {
        List<OrderItemDTO> itemDTOs = orden.items.stream()
                .map(OrderItemDTO::from)
                .toList();

        BigDecimal totalAmount = itemDTOs.stream()
                .map(OrderItemDTO::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderResponse(
                orden.orderCode,
                orden.status,
                orden.customerName,
                totalAmount,
                itemDTOs,
                orden.createdAt
        );
    }
}
