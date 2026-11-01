package com.horaazul.dto;

import java.util.UUID;

/**
 * DTO de respuesta para el endpoint {@code PATCH /api/cards/{id}/deactivate}.
 *
 * <p>Validates: Requirements 6.3</p>
 *
 * @param id      UUID de la tarjeta desactivada
 * @param active  siempre {@code false} tras la desactivación
 * @param message mensaje de confirmación para el cliente
 */
public record DeactivateResponse(
        UUID id,
        boolean active,
        String message
) {}
