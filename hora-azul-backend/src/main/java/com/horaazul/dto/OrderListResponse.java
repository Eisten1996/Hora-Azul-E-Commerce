package com.horaazul.dto;

import java.util.List;

/**
 * Respuesta paginada del listado de órdenes del panel.
 *
 * <p>Validates: Requirements 12.1</p>
 *
 * @param content       órdenes de la página actual
 * @param page          número de página actual (0-indexed)
 * @param size          tamaño de página usado en esta consulta
 * @param totalElements total de órdenes que cumplen el filtro
 * @param totalPages    número total de páginas
 */
public record OrderListResponse(
        List<OrderSummaryDTO> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
