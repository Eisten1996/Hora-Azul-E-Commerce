package com.horaazul.exception;

import com.horaazul.dto.ErrorResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import java.time.Instant;
import java.util.stream.Collectors;

/**
 * Mapper centralizado de excepciones a respuestas JSON homogéneas.
 *
 * <p>Usa {@code @ServerExceptionMapper} de RESTEasy Reactive (quarkus-rest-jackson),
 * que es el mecanismo recomendado para Quarkus REST con Jakarta EE.</p>
 *
 * <p>Validates: Requirements 6.6, 6.7, 6.8, 6.9, 6.10</p>
 */
public class GlobalExceptionMapper {

    // ------------------------------------------------------------------ //
    //  422 – Violaciones de Bean Validation                               //
    // ------------------------------------------------------------------ //

    /**
     * Mapea {@link ConstraintViolationException} → 422 con lista de errores de campo.
     *
     * <p>Validates: Requirements 6.9</p>
     */
    @ServerExceptionMapper
    public Response handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(GlobalExceptionMapper::formatViolation)
                .collect(Collectors.joining("; "));

        return buildResponse(422, "VALIDATION_ERROR", message);
    }

    // ------------------------------------------------------------------ //
    //  422 – Precio inválido                                              //
    // ------------------------------------------------------------------ //

    /**
     * Mapea {@link InvalidPriceException} → 422.
     *
     * <p>Validates: Requirements 6.7</p>
     */
    @ServerExceptionMapper
    public Response handleInvalidPrice(InvalidPriceException ex) {
        return buildResponse(422, "INVALID_PRICE", ex.getMessage());
    }

    // ------------------------------------------------------------------ //
    //  409 – Conflicto de número de catálogo                             //
    // ------------------------------------------------------------------ //

    /**
     * Mapea {@link CatalogNumberConflictException} → 409.
     *
     * <p>Validates: Requirements 6.6</p>
     */
    @ServerExceptionMapper
    public Response handleCatalogNumberConflict(CatalogNumberConflictException ex) {
        return buildResponse(409, "CATALOG_NUMBER_CONFLICT", ex.getMessage());
    }

    // ------------------------------------------------------------------ //
    //  400 – Petición incorrecta (ej. carrito vacío)                      //
    // ------------------------------------------------------------------ //

    /**
     * Mapea {@link BadRequestException} → 400.
     *
     * <p>Validates: Requirements 5.6</p>
     */
    @ServerExceptionMapper
    public Response handleBadRequest(BadRequestException ex) {
        String message = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "La petición no es válida.";
        return buildResponse(400, "BAD_REQUEST", message);
    }

    // ------------------------------------------------------------------ //
    //  404 – Recurso no encontrado                                        //
    // ------------------------------------------------------------------ //

    /**
     * Mapea {@link NotFoundException} (JAX-RS / Panache) → 404.
     *
     * <p>Validates: Requirements 6.8</p>
     */
    @ServerExceptionMapper
    public Response handleNotFound(NotFoundException ex) {
        String message = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "El recurso solicitado no fue encontrado.";
        return buildResponse(404, "NOT_FOUND", message);
    }

    // ------------------------------------------------------------------ //
    //  401 – No autorizado                                                //
    // ------------------------------------------------------------------ //

    /**
     * Mapea {@link io.quarkus.security.UnauthorizedException} → 401.
     *
     * <p>Validates: Requirements 6.10</p>
     */
    @ServerExceptionMapper
    public Response handleUnauthorized(io.quarkus.security.UnauthorizedException ex) {
        return buildResponse(401, "UNAUTHORIZED", "Credenciales de administrador requeridas.");
    }

    // ------------------------------------------------------------------ //
    //  Helpers                                                            //
    // ------------------------------------------------------------------ //

    private static String formatViolation(ConstraintViolation<?> v) {
        // propertyPath puede ser "method.paramName.fieldName"; tomamos el último segmento
        String path = v.getPropertyPath().toString();
        String field = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
        return field + ": " + v.getMessage();
    }

    private static Response buildResponse(int status, String error, String message) {
        ErrorResponse body = new ErrorResponse(
                status,
                error,
                message,
                Instant.now().toString());
        return Response.status(status).entity(body).build();
    }
}
