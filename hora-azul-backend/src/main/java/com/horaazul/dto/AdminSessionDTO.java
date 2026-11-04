package com.horaazul.dto;

/**
 * Identidad del administrador autenticado.
 *
 * <p>Validates: Requirements 10.12</p>
 *
 * @param username nombre del usuario cuyas credenciales se validaron
 */
public record AdminSessionDTO(String username) {}
