package com.horaazul.model;

/**
 * Estado de una orden de compra en Hora Azul.
 *
 * <p>En el MVP solo existe el estado {@link #PENDING_PAYMENT}: la orden ha sido
 * registrada pero el pago aún no ha sido confirmado por el equipo de Hora Azul
 * a través de WhatsApp.</p>
 */
public enum OrderStatus {
    PENDING_PAYMENT
}
