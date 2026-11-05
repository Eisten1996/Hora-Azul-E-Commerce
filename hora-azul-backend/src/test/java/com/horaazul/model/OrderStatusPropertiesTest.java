package com.horaazul.model;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;

import java.util.Map;
import java.util.Set;

import static com.horaazul.model.OrderStatus.CANCELLED;
import static com.horaazul.model.OrderStatus.DELIVERED;
import static com.horaazul.model.OrderStatus.PAID;
import static com.horaazul.model.OrderStatus.PENDING_PAYMENT;
import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Property 8: Solo transiciones permitidas.
 *
 * <p>Validates: Requirements 12.4</p>
 */
class OrderStatusPropertiesTest {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            PENDING_PAYMENT, Set.of(PAID, CANCELLED),
            PAID, Set.of(DELIVERED, CANCELLED),
            DELIVERED, Set.of(),
            CANCELLED, Set.of());

    @Property
    void soloSePermitenLosCuatroCambiosDelCriterio(@ForAll OrderStatus from, @ForAll OrderStatus to) {
        assertEquals(ALLOWED.get(from).contains(to), from.canTransitionTo(to));
    }
}
