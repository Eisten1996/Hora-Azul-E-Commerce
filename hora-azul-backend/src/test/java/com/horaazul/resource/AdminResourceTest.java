package com.horaazul.resource;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

/**
 * Tests de integración de {@link AdminResource}.
 *
 * <p>Validates: Requirements 10.12</p>
 */
@QuarkusTest
class AdminResourceTest {

    private static final String SESSION = "/api/admin/session";

    @Test
    void credencialesValidasDevuelvenElUsuario() {
        given()
                .auth().preemptive().basic("admin", "admin123")
                .when().get(SESSION)
                .then()
                .statusCode(200)
                .body("username", equalTo("admin"));
    }

    @Test
    void sinCredencialesDevuelve401() {
        given()
                .when().get(SESSION)
                .then()
                .statusCode(401);
    }

    @Test
    void contrasenaErroneaYUsuarioInexistenteResponden401Igual() {
        String wrongPassword = given()
                .auth().preemptive().basic("admin", "incorrecta")
                .when().get(SESSION)
                .then()
                .statusCode(401)
                .extract().body().asString();

        String unknownUser = given()
                .auth().preemptive().basic("otro", "admin123")
                .when().get(SESSION)
                .then()
                .statusCode(401)
                .extract().body().asString();

        assertEquals(wrongPassword, unknownUser);
    }

    @Test
    void el401LlevaCabecerasCorsParaQueElPanelPuedaLeerlo() {
        given()
                .header("Origin", "https://hora-azul-e-commerce.pages.dev")
                .auth().preemptive().basic("admin", "incorrecta")
                .when().get(SESSION)
                .then()
                .statusCode(401)
                .header("Access-Control-Allow-Origin", notNullValue());
    }
}
