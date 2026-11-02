package com.horaazul.dto;

/**
 * Respuesta de error homogénea para todos los endpoints de la API.
 *
 * <p>Validates: Requirements 6.6, 6.7, 6.8, 6.9, 6.10</p>
 *
 * @param status    Código HTTP (ej. 404, 409, 422).
 * @param error     Código de error legible por máquina (ej. "NOT_FOUND").
 * @param message   Descripción legible por humanos.
 * @param timestamp Momento en que ocurrió el error, en formato ISO-8601.
 */
public record ErrorResponse(
        int status,
        String error,
        String message,
        String timestamp) {
}
