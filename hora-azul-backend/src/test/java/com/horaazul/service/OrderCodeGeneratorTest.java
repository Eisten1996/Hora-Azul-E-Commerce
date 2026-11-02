package com.horaazul.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.IntRange;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests de {@link OrderCodeGenerator} con un {@link EntityManager} simulado.
 *
 * <p>Validates: Requirements 5.7</p>
 */
class OrderCodeGeneratorTest {

    private static final int YEAR = LocalDate.now().getYear();

    @Test
    void primerCodigoDelAnioEmpiezaEn0001() {
        OrderCodeGenerator generator = generatorReturningMax(() -> null);

        assertEquals("ORD-" + YEAR + "-0001", generator.generateNext());
    }

    @Test
    void conNOrdenesDelAnioGeneraElSiguienteNumero() {
        Query query = mock(Query.class);
        OrderCodeGenerator generator = generatorWithQuery(query, () -> "ORD-" + YEAR + "-0041");

        assertEquals("ORD-" + YEAR + "-0042", generator.generateNext());
        verify(query).setParameter("prefix", "ORD-" + YEAR + "-%");
    }

    // Feature: hora-azul-ecommerce, Propiedad 2: Unicidad de código de orden por año
    // Validates: Requirements 5.7
    @Property(tries = 100)
    void codigosGeneradosEnElMismoAnioSonDistintos(
            @ForAll @IntRange(min = 0, max = 9000) int existingOrders,
            @ForAll @IntRange(min = 1, max = 200) int newOrders) {
        TreeSet<String> stored = new TreeSet<>();
        for (int i = 1; i <= existingOrders; i++) {
            stored.add(String.format("ORD-%d-%04d", YEAR, i));
        }
        OrderCodeGenerator generator = generatorReturningMax(() -> stored.isEmpty() ? null : stored.last());

        Set<String> generated = new HashSet<>();
        for (int i = 0; i < newOrders; i++) {
            String code = generator.generateNext();
            assertTrue(code.matches("ORD-" + YEAR + "-\\d{4}"), code);
            assertTrue(generated.add(code), "Código duplicado: " + code);
            assertTrue(stored.add(code), "Código ya existente: " + code);
        }
        assertEquals(String.format("ORD-%d-%04d", YEAR, existingOrders + newOrders), stored.last());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static OrderCodeGenerator generatorReturningMax(Supplier<String> maxCode) {
        return generatorWithQuery(mock(Query.class), maxCode);
    }

    /**
     * Crea un generador cuyo {@code SELECT MAX(orderCode)} devuelve lo que indique {@code maxCode}.
     */
    private static OrderCodeGenerator generatorWithQuery(Query query, Supplier<String> maxCode) {
        EntityManager em = mock(EntityManager.class);
        when(em.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("prefix"), anyString())).thenReturn(query);
        when(query.getSingleResult()).thenAnswer(invocation -> maxCode.get());

        OrderCodeGenerator generator = new OrderCodeGenerator();
        generator.em = em;
        return generator;
    }
}
