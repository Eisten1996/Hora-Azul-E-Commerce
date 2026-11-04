package com.horaazul.dto;

import java.util.UUID;

/**
 * Respuesta de activar o desactivar una tarjeta.
 *
 * <p>Validates: Requirements 6.3, 11.12</p>
 *
 * @param id      UUID de la tarjeta
 * @param active  estado de la tarjeta tras la operación
 * @param message mensaje de confirmación para el cliente
 */
public record CardStatusResponse(
        UUID id,
        boolean active,
        String message
) {}
