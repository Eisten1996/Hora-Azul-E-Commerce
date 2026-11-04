package com.horaazul.model;

/**
 * Estado de una orden de compra en Hora Azul.
 *
 * <p>Toda orden nace en {@link #PENDING_PAYMENT}. {@link #DELIVERED} y
 * {@link #CANCELLED} son estados finales: la orden ya no cambia.</p>
 *
 * <p>Validates: Requirements 12.4</p>
 */
public enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    DELIVERED,
    CANCELLED;

    /**
     * Indica si una orden en este estado puede pasar a {@code target}.
     *
     * @param target estado solicitado
     * @return {@code true} solo para los cambios permitidos
     */
    public boolean canTransitionTo(OrderStatus target) {
        return switch (this) {
            case PENDING_PAYMENT -> target == PAID || target == CANCELLED;
            case PAID -> target == DELIVERED || target == CANCELLED;
            case DELIVERED, CANCELLED -> false;
        };
    }
}
