package com.horaazul.service;

import com.horaazul.dto.OrderItemDTO;
import com.horaazul.dto.OrderRequest;
import com.horaazul.dto.OrderRequestItem;
import com.horaazul.dto.OrderResponse;
import com.horaazul.model.OrderStatus;
import com.horaazul.repository.OrdenRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tests de {@link OrderService} contra H2 con las tarjetas de {@code import.sql}.
 *
 * <p>Se ejecutan con {@code @QuarkusTest} porque el servicio persiste entidades
 * Panache (active record), que requieren el contenedor de Quarkus.</p>
 *
 * <p>Validates: Requirements 5.6, 5.7, 7.1</p>
 */
@QuarkusTest
class OrderServiceTest {

    /** Tarjeta 1 del catálogo semilla: S/. 15.00. */
    static final UUID CARD_15 = UUID.fromString("a1000001-0000-0000-0000-000000000001");
    /** Tarjeta 2 del catálogo semilla: S/. 17.00. */
    static final UUID CARD_17 = UUID.fromString("a1000002-0000-0000-0000-000000000002");

    @Inject
    OrderService orderService;

    @Inject
    OrdenRepository ordenRepository;

    @Test
    void calculaSubtotalesYTotalConVariosItems() {
        OrderResponse response = orderService.create(orderRequest(
                new OrderRequestItem(CARD_15, 2),
                new OrderRequestItem(CARD_17, 3)));

        assertEquals(new BigDecimal("81.00"), response.totalAmount());
        assertEquals(OrderStatus.PENDING_PAYMENT, response.status());
        assertTrue(response.orderCode().matches("ORD-\\d{4}-\\d{4}"), response.orderCode());

        List<BigDecimal> subtotals = response.items().stream().map(OrderItemDTO::subtotal).toList();
        assertEquals(List.of(new BigDecimal("30.00"), new BigDecimal("51.00")), subtotals);
        assertEquals(1, response.items().get(0).catalogNumber());
        assertEquals(new BigDecimal("17.00"), response.items().get(1).unitPrice());
    }

    @Test
    void ordenesConsecutivasTienenCodigosDistintos() {
        String first = orderService.create(orderRequest(new OrderRequestItem(CARD_15, 1))).orderCode();
        String second = orderService.create(orderRequest(new OrderRequestItem(CARD_15, 1))).orderCode();

        assertEquals(sequence(first) + 1, sequence(second));
    }

    @Test
    void itemConTarjetaInexistenteLanzaNotFoundYNoPersisteLaOrden() {
        long ordersBefore = ordenRepository.count();

        assertThrows(NotFoundException.class, () -> orderService.create(orderRequest(
                new OrderRequestItem(CARD_15, 1),
                new OrderRequestItem(UUID.randomUUID(), 1))));
        assertEquals(ordersBefore, ordenRepository.count());
    }

    @Test
    void carritoVacioLanzaBadRequest() {
        assertThrows(BadRequestException.class, () -> orderService.create(orderRequest()));
    }

    static OrderRequest orderRequest(OrderRequestItem... items) {
        return new OrderRequest(
                "Cliente de Prueba",
                "987654321",
                "Av. Siempre Viva 742, Lima",
                LocalDate.now().plusDays(3),
                List.of(items));
    }

    private static int sequence(String orderCode) {
        return Integer.parseInt(orderCode.substring(orderCode.lastIndexOf('-') + 1));
    }
}
