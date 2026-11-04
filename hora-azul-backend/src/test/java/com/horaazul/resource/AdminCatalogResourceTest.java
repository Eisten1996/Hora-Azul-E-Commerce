package com.horaazul.resource;

import com.horaazul.repository.OrdenRepository;
import com.horaazul.repository.TarjetaRepository;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import jakarta.inject.Inject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests de integración de la gestión del catálogo desde el panel.
 *
 * <p>Las tarjetas que crea cada test se borran al terminar, porque otros tests
 * comprueban que el catálogo semilla tiene 33 tarjetas activas.</p>
 *
 * <p>Validates: Requirements 11.3, 11.5, 11.10, 11.11, 11.12, 11.13, 11.15</p>
 */
@QuarkusTest
class AdminCatalogResourceTest {

    private static final String SEED_CARD_ID = "a1000001-0000-0000-0000-000000000001";

    @Inject
    TarjetaRepository tarjetaRepository;

    @Inject
    OrdenRepository ordenRepository;

    private final List<UUID> createdCards = new ArrayList<>();

    @AfterEach
    void deleteCreatedCards() {
        QuarkusTransaction.requiringNew().run(() -> createdCards.forEach(tarjetaRepository::deleteById));
    }

    // -------------------------------------------------------------------------
    // GET /api/admin/cards
    // -------------------------------------------------------------------------

    @Test
    void elListadoDelPanelIncluyeLasInactivasYElPublicoNo() {
        String id = createCard(100, 15.00, List.of());
        deactivate(id);

        admin()
                .when().get("/api/admin/cards")
                .then()
                .statusCode(200)
                .body("catalogNumber[0]", equalTo(1))
                .body("find { it.catalogNumber == 100 }.id", equalTo(id))
                .body("find { it.catalogNumber == 100 }.active", equalTo(false))
                .body("find { it.catalogNumber == 100 }.coverImageUrl", nullValue())
                .body("find { it.catalogNumber == 1 }.active", equalTo(true))
                .body("find { it.catalogNumber == 1 }.name", equalTo("Pastel de cumpleaños"))
                .body("find { it.catalogNumber == 1 }.categories", hasItem("CUMPLEANOS"))
                .body("find { it.catalogNumber == 1 }.price", equalTo(15.0f));

        given()
                .when().get("/api/cards")
                .then()
                .statusCode(200)
                .body("content.id", not(hasItem(id)));
    }

    @Test
    void elListadoDelPanelRequiereCredenciales() {
        given()
                .when().get("/api/admin/cards")
                .then()
                .statusCode(401);
    }

    // -------------------------------------------------------------------------
    // PATCH /api/cards/{id}/activate
    // -------------------------------------------------------------------------

    // Feature: hora-azul-panel-admin, Property 10: Ida y vuelta de activación
    @Test
    void desactivarYActivarDevuelveLaTarjetaAlCatalogoConLosMismosDatos() {
        String id = createCard(101, 20.00, images(3));
        Map<String, Object> before = detail(id);

        deactivate(id);
        given()
                .when().get("/api/cards/{id}", id)
                .then()
                .statusCode(200)
                .body("active", equalTo(false));

        admin()
                .when().patch("/api/cards/{id}/activate", id)
                .then()
                .statusCode(200)
                .body("id", equalTo(id))
                .body("active", equalTo(true));

        assertEquals(before, detail(id));
        given()
                .when().get("/api/cards")
                .then()
                .body("content.id", hasItem(id));
    }

    @Test
    void activarRequiereCredenciales() {
        given()
                .when().patch("/api/cards/{id}/activate", SEED_CARD_ID)
                .then()
                .statusCode(401);
    }

    @Test
    void activarUnaTarjetaInexistenteDevuelve404() {
        admin()
                .when().patch("/api/cards/{id}/activate", UUID.randomUUID())
                .then()
                .statusCode(404);
    }

    // -------------------------------------------------------------------------
    // Reglas de alta y edición
    // -------------------------------------------------------------------------

    @Test
    void aceptaNumerosDeCatalogoMayoresQue33() {
        String id = createCard(34, 15.00, List.of());

        given()
                .when().get("/api/cards/{id}", id)
                .then()
                .statusCode(200)
                .body("catalogNumber", equalTo(34));
    }

    @Test
    void rechazaElNumeroDeCatalogoCero() {
        admin()
                .contentType(ContentType.JSON)
                .body(cardBody(0, 15.00, List.of()))
                .when().post("/api/cards")
                .then()
                .statusCode(422);
    }

    @Test
    void aceptaDiezImagenesYRechazaOnceAlCrear() {
        createCard(102, 15.00, images(10));

        admin()
                .contentType(ContentType.JSON)
                .body(cardBody(103, 15.00, images(11)))
                .when().post("/api/cards")
                .then()
                .statusCode(422);
    }

    @Test
    void rechazaOnceImagenesAlEditar() {
        String id = createCard(104, 15.00, images(1));
        Map<String, Object> body = cardBody(104, 15.00, images(11));
        body.remove("catalogNumber");

        admin()
                .contentType(ContentType.JSON)
                .body(body)
                .when().put("/api/cards/{id}", id)
                .then()
                .statusCode(422);
    }

    @Test
    void editarReemplazaLasImagenesEnElOrdenIndicado() {
        String id = createCard(105, 15.00, images(3));
        Map<String, Object> body = cardBody(105, 17.00, images(2));
        body.remove("catalogNumber");

        admin()
                .contentType(ContentType.JSON)
                .body(body)
                .when().put("/api/cards/{id}", id)
                .then()
                .statusCode(200)
                .body("catalogNumber", equalTo(105))
                .body("price", equalTo(17.0f));

        Map<String, Object> saved = detail(id);
        List<Map<String, Object>> savedImages = (List<Map<String, Object>>) saved.get("images");
        assertEquals(List.of("cards/foto-0.webp", "cards/foto-1.webp"),
                savedImages.stream().map(image -> image.get("url")).toList());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static RequestSpecification admin() {
        return given().auth().preemptive().basic("admin", "admin123");
    }

    private String createCard(int catalogNumber, double price, List<Map<String, Object>> images) {
        String id = admin()
                .contentType(ContentType.JSON)
                .body(cardBody(catalogNumber, price, images))
                .when().post("/api/cards")
                .then()
                .statusCode(201)
                .extract().path("id");
        createdCards.add(UUID.fromString(id));
        return id;
    }

    private static void deactivate(String id) {
        admin()
                .when().patch("/api/cards/{id}/deactivate", id)
                .then()
                .statusCode(200);
    }

    /** Detalle de la tarjeta sin los campos que cambian al activarla o desactivarla. */
    private static Map<String, Object> detail(String id) {
        Map<String, Object> detail = new HashMap<>(given()
                .when().get("/api/cards/{id}", id)
                .then()
                .statusCode(200)
                .extract().<Map<String, Object>>path("$"));
        detail.remove("updatedAt");
        return Collections.unmodifiableMap(detail);
    }

    private static Map<String, Object> order(String orderCode) {
        return admin()
                .when().get("/api/orders/{orderCode}", orderCode)
                .then()
                .statusCode(200)
                .extract().path("$");
    }

    private long countOrders() {
        return QuarkusTransaction.requiringNew().call(() -> ordenRepository.count());
    }

    private static List<Map<String, Object>> images(int count) {
        List<Map<String, Object>> images = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            images.add(Map.of(
                    "url", "cards/foto-" + i + ".webp",
                    "sortOrder", i,
                    "imageType", i == 0 ? "COVER" : "OPEN"));
        }
        return images;
    }

    private static Map<String, Object> cardBody(int catalogNumber, double price, List<Map<String, Object>> images) {
        Map<String, Object> body = new HashMap<>();
        body.put("catalogNumber", catalogNumber);
        body.put("name", "Tarjeta de prueba");
        body.put("categories", List.of("FLORES"));
        body.put("price", price);
        body.put("envelopeIncluded", true);
        body.put("images", images);
        return body;
    }

    private static Map<String, Object> orderBody(List<Map<String, Object>> items) {
        return Map.of(
                "customerName", "Cliente de Prueba",
                "customerPhone", "987654321",
                "deliveryAddress", "Av. Siempre Viva 742, Lima",
                "estimatedDeliveryDate", LocalDate.now().plusDays(3).toString(),
                "items", items);
    }
}
