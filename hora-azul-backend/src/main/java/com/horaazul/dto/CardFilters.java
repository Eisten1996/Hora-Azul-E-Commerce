package com.horaazul.dto;

import com.horaazul.model.CardCategory;

import java.math.BigDecimal;

/**
 * Filtros para la consulta paginada del catálogo de tarjetas.
 *
 * <p>Todos los campos son opcionales; los que son {@code null} se ignoran
 * en la consulta. La paginación usa valores por defecto conservadores:
 * página 0 y tamaño 100.</p>
 *
 * <p>Validates: Requirements 6.4, 1.2, 2.1, 2.2</p>
 *
 * @param category categoría para filtrar, o {@code null} para todas
 * @param minPrice precio mínimo inclusivo, o {@code null} sin límite inferior
 * @param maxPrice precio máximo inclusivo, o {@code null} sin límite superior
 * @param page     número de página 0-indexed (default 0)
 * @param size     tamaño de página (default 100)
 */
public record CardFilters(
        CardCategory category,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        int page,
        int size
) {
    /** Crea un filtro vacío que retorna la primera página completa. */
    public static CardFilters empty() {
        return new CardFilters(null, null, null, 0, 100);
    }
}
