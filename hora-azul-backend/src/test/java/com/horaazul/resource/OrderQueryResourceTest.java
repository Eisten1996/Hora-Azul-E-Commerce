package com.horaazul.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tests de integración de las consultas de órdenes del panel.
 *
 * <p>La base de datos es compartida con otros tests que crean órdenes, así que aquí se
 * comprueban las órdenes propias y los invariantes, no los totales exactos.</p>
 *
 * <p>Validates: Requirements 12.1, 12.2, 12.3, 12.10, 12.11</p>
 */
@QuarkusTest
class OrderQueryResourceTest {

    private static final String SEED_CARD_ID = "a1000001-0000-0000-0000-000000000001";

    @Test
    void lasOrdenesVanDeLaMasRecienteALaMasAntiguaEnTodasLasPaginas() {
        List<String> created = List.of(createOrder(), createOrder(), createOrder());
        int total = admin().when().get("/api/orders").jsonPath().getInt("totalElements");

        List<String> seen = new ArrayList<>();
        List<LocalDateTime> dates = new ArrayList<>();
        int pages = admin().queryParam("size", 2).when().get("/api/orders").jsonPath().getInt("totalPages");
        for (int page = 0; page < pages; page++) {
            JsonPath body = admin().queryParam("size", 2).queryParam("page", page)
                    .when().get("/api/orders").jsonPath();
            assertEquals(page, body.getInt("page"));
            assertEquals(2, body.getInt("size"));
            seen.addAll(body.getList("content.orderCode"));
            body.<String>getList("content.createdAt").forEach(date -> dates.add(LocalDateTime.parse(date)));
        }

        assertEquals(total, seen.size());
        assertEquals(total, new HashSet<>(seen).size(), "ninguna orden se repite entre páginas");
        assertTrue(seen.containsAll(created));
        List<LocalDateTime> newestFirst = dates.stream().sorted(Comparator.reverseOrder()).toList();
        assertEquals(newestFirst, dates);
        // Creadas en este orden: la última aparece antes que la primera
        assertTrue(seen.indexOf(created.get(2)) < seen.indexOf(created.get(0)));
    }

    @Test
    void elResumenTraeLosDatosDelListado() {
        String code = createOrder();

        admin()
                .queryParam("size", 100)
                .when().get("/api/orders")
                .then()
                .statusCode(200)
                .body("content.find { it.orderCode == '" + code + "' }.customerName", equalTo("Cliente de Prueba"))
                .body("content.find { it.orderCode == '" + code + "' }.totalAmount", equalTo(30.0f))
                .body("content.find { it.orderCode == '" + code + "' }.status", equalTo("PENDING_PAYMENT"))
                .body("content.find { it.orderCode == '" + code + "' }.createdAt", notNullValue());
    }

    @Test
    void porDefectoDevuelve20PorPaginaYElTamanoSeLimitaA100() {
        admin().when().get("/api/orders").then().statusCode(200).body("size", equalTo(20)).body("page", equalTo(0));
        admin().queryParam("size", 1000).when().get("/api/orders").then().statusCode(200).body("size", equalTo(100));
    }

    @Test
    void filtraPorEstado() {
        String pending = createOrder();
        String cancelled = createOrder();
        admin()
                .contentType(ContentType.JSON)
                .body(Map.of("status", "CANCELLED"))
                .when().patch("/api/orders/{orderCode}/status", cancelled)
                .then().statusCode(200);

        admin()
                .queryParam("status", "CANCELLED")
                .queryParam("size", 100)
                .when().get("/api/orders")
                .then()
                .statusCode(200)
                .body("content.status", everyItem(equalTo("CANCELLED")))
                .body("content.orderCode", hasItem(cancelled))
                .body("content.orderCode", not(hasItem(pending)));
    }

    @Test
    void unEstadoVacioNoFiltra() {
        String code = createOrder();

        admin()
                .queryParam("status", "")
                .when().get("/api/orders")
                .then()
                .statusCode(200)
                .body("content.orderCode", hasItem(code));
    }

    @Test
    void unEstadoInexistenteDevuelve400ConMensaje() {
        admin()
                .queryParam("status", "INVENTADO")
                .when().get("/api/orders")
                .then()
                .statusCode(400)
                .body("error", equalTo("BAD_REQUEST"))
                .body("message", containsString("INVENTADO"))
                .body("message", containsString("PENDING_PAYMENT"));
    }

    @Test
    void unaPaginaFueraDeRangoVieneVacia() {
        admin()
                .queryParam("page", 100000)
                .when().get("/api/orders")
                .then()
                .statusCode(200)
                .body("content", hasSize(0));
    }

    @Test
    void elDetalleIncluyeContactoEntregaEItems() {
        String code = createOrder();

        admin()
                .when().get("/api/orders/{orderCode}", code)
                .then()
                .statusCode(200)
                .body("orderCode", equalTo(code))
                .body("status", equalTo("PENDING_PAYMENT"))
                .body("customerName", equalTo("Cliente de Prueba"))
                .body("customerPhone", equalTo("987654321"))
                .body("deliveryAddress", equalTo("Av. Siempre Viva 742, Lima"))
                .body("estimatedDeliveryDate", equalTo(LocalDate.now().plusDays(3).toString()))
                .body("totalAmount", equalTo(30.0f))
                .body("items[0].cardName", equalTo("Pastel de cumpleaños"))
                .body("items[0].quantity", equalTo(2))
                .body("items[0].subtotal", equalTo(30.0f));
    }

    @Test
    void laRespuestaPublicaDeCreacionNoExponeLosCamposNuevos() {
        given()
                .contentType(ContentType.JSON)
                .body(orderBody())
                .when().post("/api/orders")
                .then()
                .statusCode(201)
                .body("$", not(hasKey("customerPhone")))
                .body("$", not(hasKey("deliveryAddress")))
                .body("$", not(hasKey("estimatedDeliveryDate")));
    }

    @Test
    void elDetalleSinCredencialesDevuelve401() {
        given().when().get("/api/orders/{orderCode}", createOrder()).then().statusCode(401);
    }

    private static RequestSpecification admin() {
        return given().auth().preemptive().basic("admin", "admin123");
    }

    private static String createOrder() {
        return given()
                .contentType(ContentType.JSON)
                .body(orderBody())
                .when().post("/api/orders")
                .then()
                .statusCode(201)
                .extract().path("orderCode");
    }

    private static Map<String, Object> orderBody() {
        return Map.of(
                "customerName", "Cliente de Prueba",
                "customerPhone", "987654321",
                "deliveryAddress", "Av. Siempre Viva 742, Lima",
                "estimatedDeliveryDate", LocalDate.now().plusDays(3).toString(),
                "items", List.of(Map.of("tarjetaId", SEED_CARD_ID, "quantity", 2)));
    }
}
