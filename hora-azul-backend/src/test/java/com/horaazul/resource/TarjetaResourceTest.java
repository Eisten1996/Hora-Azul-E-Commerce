package com.horaazul.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.empty;

/**
 * Tests de integración de {@link TarjetaResource} contra H2 con los datos de {@code import.sql}.
 *
 * <p>Validates: Requirements 6.1, 6.4, 6.5, 6.6, 6.7, 6.10</p>
 */
@QuarkusTest
class TarjetaResourceTest {

    /** Tarjeta 1 del catálogo semilla: "Globos de Cumpleaños". */
    private static final String SEED_CARD_ID = "a1000001-0000-0000-0000-000000000001";

    private static final String ADMIN_USER = "admin";
    private static final String ADMIN_PASSWORD = "admin123";

    // -------------------------------------------------------------------------
    // Endpoints públicos
    // -------------------------------------------------------------------------

    @Test
    void listarSinFiltrosDevuelveLasTarjetasActivas() {
        given()
                .when().get("/api/cards")
                .then()
                .statusCode(200)
                .body("totalElements", equalTo(33))
                .body("content", hasSize(33))
                .body("content.catalogNumber[0]", equalTo(1));
    }

    @Test
    void listarConCategoriaYPrecioMaximoAplicaAmbosFiltros() {
        given()
                .queryParam("category", "FLORES")
                .queryParam("maxPrice", 20)
                .when().get("/api/cards")
                .then()
                .statusCode(200)
                .body("content", not(empty()))
                .body("content.category", everyItem(equalTo("FLORES")))
                .body("content.price", everyItem(lessThanOrEqualTo(20.0f)));
    }

    @Test
    void obtenerPorIdExistenteDevuelveElDetalleCompleto() {
        given()
                .when().get("/api/cards/{id}", SEED_CARD_ID)
                .then()
                .statusCode(200)
                .body("id", equalTo(SEED_CARD_ID))
                .body("catalogNumber", equalTo(1))
                .body("name", equalTo("Globos de Cumpleaños"))
                .body("images.size()", greaterThan(0));
    }

    @Test
    void obtenerPorIdInexistenteDevuelve404() {
        given()
                .when().get("/api/cards/{id}", UUID.randomUUID())
                .then()
                .statusCode(404)
                .body("error", equalTo("NOT_FOUND"));
    }

    // -------------------------------------------------------------------------
    // Endpoints de administración
    // -------------------------------------------------------------------------

    @Test
    void crearSinCredencialesDevuelve401() {
        given()
                .contentType(ContentType.JSON)
                .body(cardBody(10, 15.00))
                .when().post("/api/cards")
                .then()
                .statusCode(401);
    }

    @Test
    void crearConPrecioInvalidoDevuelve422() {
        given()
                .auth().preemptive().basic(ADMIN_USER, ADMIN_PASSWORD)
                .contentType(ContentType.JSON)
                .body(cardBody(10, 25.00))
                .when().post("/api/cards")
                .then()
                .statusCode(422)
                .body("error", equalTo("INVALID_PRICE"));
    }

    @Test
    void crearConCatalogNumberDuplicadoDevuelve409() {
        given()
                .auth().preemptive().basic(ADMIN_USER, ADMIN_PASSWORD)
                .contentType(ContentType.JSON)
                .body(cardBody(1, 15.00))
                .when().post("/api/cards")
                .then()
                .statusCode(409)
                .body("error", equalTo("CATALOG_NUMBER_CONFLICT"));
    }

    private static Map<String, Object> cardBody(int catalogNumber, double price) {
        return Map.of(
                "catalogNumber", catalogNumber,
                "name", "Tarjeta de prueba",
                "category", "FLORES",
                "price", price,
                "envelopeIncluded", true,
                "images", List.of());
    }
}
