package com.horaazul.repository;

import com.horaazul.model.Orden;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
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
     * Retorna todas las órdenes ordenadas por fecha de creación descendente
     * (la más reciente primero).
     *
     * <p>Validates: Requirements 7.2</p>
     *
     * @return lista completa de órdenes ordenadas de más nueva a más antigua
     */
    public List<Orden> findAllOrderedByCreatedAtDesc() {
        return find("ORDER BY createdAt DESC").list();
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
}
