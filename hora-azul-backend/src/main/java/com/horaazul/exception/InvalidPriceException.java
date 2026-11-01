package com.horaazul.exception;

import java.math.BigDecimal;

/**
 * Excepción lanzada cuando el precio de una tarjeta no pertenece
 * al conjunto de precios válidos: {15.00, 17.00, 20.00, 30.00}.
 *
 * <p>Validates: Requirements 6.7</p>
 */
public class InvalidPriceException extends RuntimeException {

    public InvalidPriceException(BigDecimal price) {
        super("El precio " + price + " no es válido. Los precios permitidos son: 15.00, 17.00, 20.00, 30.00.");
    }
}
