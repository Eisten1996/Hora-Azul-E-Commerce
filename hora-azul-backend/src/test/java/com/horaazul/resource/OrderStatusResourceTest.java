package com.horaazul.resource;

import com.horaazul.repository.OrdenRepository;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests de integración del cambio de estado de una orden.
 *
 * <p>Validates: Requirements 12.4, 12.5, 12.10, 12.11</p>
 */
@QuarkusTest
class OrderStatusResourceTest {

    private static final String SEED_CARD_ID = "a1000001-0000-0000-0000-000000000001";

    @Inject
    OrdenRepository ordenRepository;

    @Test
    void unaOrdenNuevaNaceEnPendienteDePago() {
        assertEquals("PENDING_PAYMENT", storedStatus(createOrder()));
    }

    @Test
    void recorreElCaminoHastaEntregadaYDevuelveElDetalle() {
        String code = createOrder();

        changeStatus(code, "PAID")
                .then()
                .statusCode(200)
                .body("orderCode", equalTo(code))
                .body("status", equalTo("PAID"))
                .body("customerPhone", equalTo("987654321"))
                .body("deliveryAddress", equalTo("Av. Siempre Viva 742, Lima"))
                .body("totalAmount", equalTo(30.0f))
                .body("items[0].quantity", equalTo(2));
        assertEquals("PAID", storedStatus(code));

        changeStatus(code, "DELIVERED").then().statusCode(200).body("status", equalTo("DELIVERED"));
        assertEquals("DELIVERED", storedStatus(code));
    }

    @Test
    void seCancelaDesdePendienteYDesdePagada() {
        String pending = createOrder();
        changeStatus(pending, "CANCELLED").then().statusCode(200).body("status", equalTo("CANCELLED"));

        String paid = createOrder();
        changeStatus(paid, "PAID").then().statusCode(200);
        changeStatus(paid, "CANCELLED").then().statusCode(200).body("status", equalTo("CANCELLED"));
    }

    @Test
    void unCambioNoPermitidoDevuelve409ConElEstadoActualYNoModificaLaOrden() {
        String code = createOrder();

        changeStatus(code, "DELIVERED")
                .then()
                .statusCode(409)
                .body("error", equalTo("ORDER_STATUS_CONFLICT"))
                .body("message", containsString("PENDING_PAYMENT"));

        assertEquals("PENDING_PAYMENT", storedStatus(code));
    }

    @Test
    void unEstadoFinalYaNoCambia() {
        String code = createOrder();
        changeStatus(code, "CANCELLED").then().statusCode(200);

        for (String target : List.of("PENDING_PAYMENT", "PAID", "DELIVERED", "CANCELLED")) {
            changeStatus(code, target)
                    .then()
                    .statusCode(409)
                    .body("message", containsString("CANCELLED"));
        }

        assertEquals("CANCELLED", storedStatus(code));
    }

    @Test
    void unaOrdenInexistenteDevuelve404() {
        changeStatus("ORD-1999-9999", "PAID").then().statusCode(404);
    }

    @Test
    void sinEstadoDevuelve422() {
        admin()
                .contentType(ContentType.JSON)
                .body(Map.of())
                .when().patch("/api/orders/{orderCode}/status", createOrder())
                .then()
                .statusCode(422)
                .body("error", equalTo("VALIDATION_ERROR"));
    }

    @Test
    void unEstadoInexistenteEnElCuerpoDevuelve400YNoModificaLaOrden() {
        String code = createOrder();

        changeStatus(code, "INVENTADO").then().statusCode(400);

        assertEquals("PENDING_PAYMENT", storedStatus(code));
    }

    @Test
    void sinCredencialesDevuelve401YNoModificaLaOrden() {
        String code = createOrder();

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("status", "PAID"))
                .when().patch("/api/orders/{orderCode}/status", code)
                .then()
                .statusCode(401);

        assertEquals("PENDING_PAYMENT", storedStatus(code));
    }

    private static RequestSpecification admin() {
        return given().auth().preemptive().basic("admin", "admin123");
    }

    private static io.restassured.response.Response changeStatus(String code, String status) {
        return admin()
                .contentType(ContentType.JSON)
                .body(Map.of("status", status))
                .when().patch("/api/orders/{orderCode}/status", code);
    }

    private String storedStatus(String code) {
        return QuarkusTransaction.requiringNew().call(
                () -> ordenRepository.findByOrderCode(code).orElseThrow().status.name());
    }

    private static String createOrder() {
        return given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "customerName", "Cliente de Prueba",
                        "customerPhone", "987654321",
                        "deliveryAddress", "Av. Siempre Viva 742, Lima",
                        "estimatedDeliveryDate", LocalDate.now().plusDays(3).toString(),
                        "items", List.of(Map.of("tarjetaId", SEED_CARD_ID, "quantity", 2))))
                .when().post("/api/orders")
                .then()
                .statusCode(201)
                .extract().path("orderCode");
    }
}
