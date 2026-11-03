package com.horaazul.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;

/**
 * Tests de integración de {@link OrderResource} contra H2 con los datos de {@code import.sql}.
 *
 * <p>Validates: Requirements 5.6, 5.7, 5.9, 7.4</p>
 */
@QuarkusTest
class OrderResourceTest {

    private static final String CARD_15 = "a1000001-0000-0000-0000-000000000001";
    private static final String CARD_17 = "a1000002-0000-0000-0000-000000000002";

    @Test
    void crearConDatosValidosDevuelve201ConCodigoYTotales() {
        given()
                .contentType(ContentType.JSON)
                .body(orderBody("987654321", List.of(
                        Map.of("tarjetaId", CARD_15, "quantity", 2),
                        Map.of("tarjetaId", CARD_17, "quantity", 1))))
                .when().post("/api/orders")
                .then()
                .statusCode(201)
                .header("Location", containsString("/api/orders/ORD-"))
                .body("orderCode", matchesPattern("ORD-\\d{4}-\\d{4}"))
                .body("status", equalTo("PENDING_PAYMENT"))
                .body("totalAmount", equalTo(47.0f))
                .body("items", hasSize(2))
                .body("items[0].subtotal", equalTo(30.0f));
    }

    @Test
    void crearConCarritoVacioDevuelve400() {
        given()
                .contentType(ContentType.JSON)
                .body(orderBody("987654321", List.of()))
                .when().post("/api/orders")
                .then()
                .statusCode(400)
                .body("error", equalTo("BAD_REQUEST"))
                .body("message", equalTo("El carrito no puede estar vacío."));
    }

    @Test
    void crearConTelefonoInvalidoDevuelve422() {
        given()
                .contentType(ContentType.JSON)
                .body(orderBody("12345", List.of(Map.of("tarjetaId", CARD_15, "quantity", 1))))
                .when().post("/api/orders")
                .then()
                .statusCode(422)
                .body("error", equalTo("VALIDATION_ERROR"))
                .body("message", containsString("customerPhone"));
    }

    @Test
    void obtenerOrdenInexistenteDevuelve404() {
        given()
                .auth().preemptive().basic("admin", "admin123")
                .when().get("/api/orders/{orderCode}", "ORD-1999-9999")
                .then()
                .statusCode(404);
    }

    @Test
    void listarOrdenesSinCredencialesDevuelve401() {
        given()
                .when().get("/api/orders")
                .then()
                .statusCode(401);
    }

    private static Map<String, Object> orderBody(String phone, List<Map<String, Object>> items) {
        return Map.of(
                "customerName", "Cliente de Prueba",
                "customerPhone", phone,
                "deliveryAddress", "Av. Siempre Viva 742, Lima",
                "estimatedDeliveryDate", LocalDate.now().plusDays(3).toString(),
                "items", items);
    }
}
