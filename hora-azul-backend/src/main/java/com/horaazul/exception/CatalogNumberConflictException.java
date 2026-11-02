package com.horaazul.exception;

/**
 * Excepción lanzada cuando se intenta crear una tarjeta con un número de catálogo
 * que ya existe en la base de datos.
 *
 * <p>Validates: Requirements 6.6</p>
 */
public class CatalogNumberConflictException extends RuntimeException {

    public CatalogNumberConflictException(Integer catalogNumber) {
        super("Ya existe una tarjeta con el número de catálogo " + catalogNumber + ".");
    }
}
