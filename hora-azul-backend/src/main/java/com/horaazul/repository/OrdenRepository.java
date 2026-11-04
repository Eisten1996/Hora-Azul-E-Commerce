package com.horaazul.repository;

import com.horaazul.model.Orden;
import com.horaazul.model.OrderStatus;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio Panache para la entidad {@link Orden}.
 *
 * <p>Proporciona consultas de administración para listar y buscar órdenes.</p>
 *
 * <p>Validates: Requirements 7.2, 7.3</p>
 */
@ApplicationScoped
public class OrdenRepository implements PanacheRepositoryBase<Orden, UUID> {

    /**
     * Consulta paginada de órdenes, de la más nueva a la más antigua. El código desempata
     * las creadas en el mismo instante, para que ninguna se repita ni se pierda entre páginas.
     *
     * <p>Validates: Requirements 12.1, 12.2</p>
     *
     * @param status estado por el que filtrar, o {@code null} para todas
     * @param page   número de página (0-indexed)
     * @param size   tamaño de página
     * @return consulta con la página ya aplicada
     */
    public PanacheQuery<Orden> findPage(OrderStatus status, int page, int size) {
        Sort newestFirst = Sort.by("createdAt", Sort.Direction.Descending)
                .and("orderCode", Sort.Direction.Descending);
        PanacheQuery<Orden> query = status == null
                ? findAll(newestFirst)
                : find("status", newestFirst, status);
        return query.page(Page.of(page, size));
    }

    /**
     * Busca una orden por su código único {@code ORD-YYYY-XXXX}.
     *
     * <p>Validates: Requirements 7.3</p>
     *
     * @param orderCode código de orden en formato {@code ORD-YYYY-XXXX}
     * @return {@link Optional} con la orden si existe, o vacío si no se encuentra
     */
    public Optional<Orden> findByOrderCode(String orderCode) {
        return find("orderCode", orderCode).firstResultOptional();
    }

    /**
     * Busca una orden y bloquea su fila hasta el final de la transacción, para que dos
     * cambios de estado simultáneos no partan ambos del mismo estado.
     *
     * <p>Validates: Requirements 12.5</p>
     *
     * @param orderCode código de orden en formato {@code ORD-YYYY-XXXX}
     * @return {@link Optional} con la orden si existe, o vacío si no se encuentra
     */
    public Optional<Orden> findByOrderCodeForUpdate(String orderCode) {
        return find("orderCode", orderCode)
                .withLock(LockModeType.PESSIMISTIC_WRITE)
                .firstResultOptional();
    }
}
