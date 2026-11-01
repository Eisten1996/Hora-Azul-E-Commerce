package com.horaazul.service;

import com.horaazul.repository.OrdenRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.time.LocalDate;

/**
 * Genera códigos de orden únicos con el formato {@code ORD-YYYY-XXXX}.
 *
 * <p>La generación consulta el máximo código existente para el año en curso
 * y devuelve el siguiente número de secuencia formateado con cuatro dígitos.
 * Si no existen órdenes para ese año, la secuencia arranca en 1.</p>
 *
 * <p>El método debe ejecutarse siempre dentro de una transacción activa
 * (anotada {@code MANDATORY}). Para el MVP sobre Neon/PostgreSQL se confía en
 * el nivel de aislamiento por defecto {@code READ COMMITTED} junto con la
 * restricción {@code UNIQUE} de la columna {@code order_code}: ante dos
 * transacciones concurrentes que generen el mismo código, la segunda fallará
 * con una violación de unicidad, que el servicio invocante puede capturar y
 * reintentar.</p>
 *
 * <p>Validates: Requirements 5.7</p>
 */
@ApplicationScoped
public class OrderCodeGenerator {

    @Inject
    EntityManager em;

    /**
     * Genera el siguiente código de orden para el año actual.
     *
     * <p>Debe invocarse dentro de una transacción activa; lanza
     * {@link jakarta.transaction.TransactionalException} si no la hay.</p>
     *
     * @return código formateado como {@code "ORD-YYYY-XXXX"}
     */
    @Transactional(Transactional.TxType.MANDATORY)
    public String generateNext() {
        int year = LocalDate.now().getYear();
        String prefix = "ORD-" + year + "-";

        // Consulta JPQL para obtener el máximo orderCode del año actual.
        // Si no existe ningún registro se devuelve null → primer orden del año.
        String maxCode = (String) em.createQuery(
                "SELECT MAX(o.orderCode) FROM Orden o WHERE o.orderCode LIKE :prefix")
                .setParameter("prefix", prefix + "%")
                .getSingleResult();

        int nextSeq;
        if (maxCode == null) {
            // Primer orden del año
            nextSeq = 1;
        } else {
            // "ORD-2025-0042" → split por "-" → ["ORD", "2025", "0042"] → índice 2
            String[] parts = maxCode.split("-");
            nextSeq = Integer.parseInt(parts[2]) + 1;
        }

        return String.format("ORD-%d-%04d", year, nextSeq);
    }
}
