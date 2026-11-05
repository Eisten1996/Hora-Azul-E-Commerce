package com.horaazul.exception;

import com.horaazul.model.OrderStatus;

/**
 * Se lanza al pedir un cambio de estado que no está permitido desde el estado actual de la orden.
 *
 * <p>Validates: Requirements 12.5</p>
 */
public class OrderStatusConflictException extends RuntimeException {

    public OrderStatusConflictException(String orderCode, OrderStatus current, OrderStatus requested) {
        super("La orden " + orderCode + " está en estado " + current
                + " y no puede pasar a " + requested + ".");
    }
}
