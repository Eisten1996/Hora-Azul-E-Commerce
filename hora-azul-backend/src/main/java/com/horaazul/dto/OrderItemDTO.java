package com.horaazul.dto;

import com.horaazul.model.OrdenItem;

import java.math.BigDecimal;

/**
 * Representa un ítem de orden serializado en la respuesta al cliente.
 *
 * <p>Incluye el snapshot de los datos de la tarjeta capturados al momento
 * de crear la orden (número de catálogo, nombre y precio unitario) más
 * la cantidad y el subtotal calculado.</p>
 *
 * <p>Validates: Requirements 7.1</p>
 *
 * @param catalogNumber número de catálogo de la tarjeta
 * @param cardName      nombre de la tarjeta en el momento de la compra
 * @param unitPrice     precio unitario capturado en el momento de la compra
 * @param quantity      cantidad comprada
 * @param subtotal      resultado de {@code unitPrice × quantity}
 */
public record OrderItemDTO(
        Integer catalogNumber,
        String cardName,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal
) {

    /**
     * Crea un {@code OrderItemDTO} a partir de la entidad {@link OrdenItem}.
     *
     * @param item entidad fuente
     * @return DTO mapeado con el subtotal calculado
     */
    public static OrderItemDTO from(OrdenItem item) {
        BigDecimal subtotal = item.unitPrice.multiply(BigDecimal.valueOf(item.quantity));
        return new OrderItemDTO(
                item.catalogNumber,
                item.cardName,
                item.unitPrice,
                item.quantity,
                subtotal
        );
    }
}
