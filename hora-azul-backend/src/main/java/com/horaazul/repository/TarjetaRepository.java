package com.horaazul.repository;

import com.horaazul.model.CardCategory;
import com.horaazul.model.Tarjeta;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Repositorio Panache para la entidad {@link Tarjeta}.
 *
 * <p>Proporciona consultas personalizadas para el catálogo público
 * con filtros opcionales de categoría y rango de precio paginados.</p>
 *
 * <p>Validates: Requirements 6.4</p>
 */
@ApplicationScoped
public class TarjetaRepository implements PanacheRepositoryBase<Tarjeta, UUID> {

    /**
     * Busca tarjetas activas aplicando filtros opcionales de categoría y precio,
     * con paginación.
     *
     * <p>Solo se incluyen tarjetas con {@code active = true}.
     * Cualquier filtro puede ser {@code null}; en ese caso se omite de la consulta.
     * El tamaño de página se limita a un máximo de 100 elementos.</p>
     *
     * @param category categoría exacta a filtrar, o {@code null} para ignorar
     * @param minPrice precio mínimo inclusivo, o {@code null} para ignorar
     * @param maxPrice precio máximo inclusivo, o {@code null} para ignorar
     * @param page     número de página 0-indexed (default 0)
     * @param size     tamaño de página (default 100, máx 100)
     * @return lista paginada de tarjetas activas que cumplen los criterios
     */
    public List<Tarjeta> findActive(
            CardCategory category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size) {

        // Normalizar parámetros de paginación
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);

        // Construir JPQL dinámico con filtros opcionales
        StringBuilder jpql = new StringBuilder("active = true");
        Parameters params = Parameters.with("dummy", true); // trick: params no permite vacío

        if (category != null) {
            jpql.append(" AND category = :category");
            params.and("category", category);
        }
        if (minPrice != null) {
            jpql.append(" AND price >= :minPrice");
            params.and("minPrice", minPrice);
        }
        if (maxPrice != null) {
            jpql.append(" AND price <= :maxPrice");
            params.and("maxPrice", maxPrice);
        }

        jpql.append(" ORDER BY catalogNumber ASC");

        PanacheQuery<Tarjeta> query = find(jpql.toString(), params);
        return query.page(Page.of(safePage, safeSize)).list();
    }

    /**
     * Cuenta el total de tarjetas activas que cumplen los filtros opcionales.
     * Útil para calcular {@code totalElements} y {@code totalPages} en la respuesta paginada.
     *
     * @param category categoría exacta a filtrar, o {@code null} para ignorar
     * @param minPrice precio mínimo inclusivo, o {@code null} para ignorar
     * @param maxPrice precio máximo inclusivo, o {@code null} para ignorar
     * @return número total de tarjetas activas que cumplen los criterios
     */
    public long countActive(
            CardCategory category,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        StringBuilder jpql = new StringBuilder("active = true");
        Parameters params = Parameters.with("dummy", true);

        if (category != null) {
            jpql.append(" AND category = :category");
            params.and("category", category);
        }
        if (minPrice != null) {
            jpql.append(" AND price >= :minPrice");
            params.and("minPrice", minPrice);
        }
        if (maxPrice != null) {
            jpql.append(" AND price <= :maxPrice");
            params.and("maxPrice", maxPrice);
        }

        return count(jpql.toString(), params);
    }
}
