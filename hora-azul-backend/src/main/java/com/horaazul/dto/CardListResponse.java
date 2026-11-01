package com.horaazul.dto;

import java.util.List;

/**
 * Respuesta paginada para el listado del catálogo de tarjetas.
 *
 * <p>Validate: Requirements 1.2, 6.4</p>
 *
 * @param content       lista de tarjetas en la página actual
 * @param totalElements total de tarjetas activas que coinciden con los filtros
 * @param totalPages    número total de páginas dado el tamaño solicitado
 * @param page          número de página actual (0-indexed)
 * @param size          tamaño de página usado en esta consulta
 */
public record CardListResponse(
        List<CardSummaryDTO> content,
        long totalElements,
        int totalPages,
        int page,
        int size
) {
    /**
     * Construye un {@code CardListResponse} a partir de los datos de la página.
     *
     * @param content       lista de DTOs de la página actual
     * @param totalElements total de elementos que coinciden con los filtros
     * @param page          número de página actual (0-indexed)
     * @param size          tamaño de página efectivo (1–100)
     * @return instancia lista para serializar como respuesta JSON
     */
    public static CardListResponse of(
            List<CardSummaryDTO> content,
            long totalElements,
            int page,
            int size) {

        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
        return new CardListResponse(content, totalElements, totalPages, page, size);
    }
}
