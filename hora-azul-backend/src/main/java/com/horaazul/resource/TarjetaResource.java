package com.horaazul.resource;

import com.horaazul.dto.CardDetailDTO;
import com.horaazul.dto.CardFilters;
import com.horaazul.dto.CardListResponse;
import com.horaazul.dto.CardSummaryDTO;
import com.horaazul.dto.DeactivateResponse;
import com.horaazul.dto.TarjetaCreateRequest;
import com.horaazul.dto.TarjetaUpdateRequest;
import com.horaazul.model.CardCategory;
import com.horaazul.model.Tarjeta;
import com.horaazul.service.TarjetaService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * Recurso JAX-RS que expone los endpoints del catálogo de tarjetas.
 *
 * <p>Los endpoints públicos ({@code GET}) no requieren autenticación.
 * Los endpoints de administración ({@code POST}, {@code PUT}, {@code PATCH})
 * requieren el rol {@code admin} y se autentican mediante HTTP Basic Auth.</p>
 *
 * <p>Validates: Requirements 1.2, 1.3, 3.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.10</p>
 */
@Path("/api/cards")
@Produces(MediaType.APPLICATION_JSON)
public class TarjetaResource {

    @Inject
    TarjetaService tarjetaService;

    // =========================================================================
    // Endpoints públicos
    // =========================================================================

    /**
     * Devuelve la lista paginada de tarjetas activas del catálogo.
     *
     * <p>Todos los query params son opcionales. El tamaño de página se limita
     * internamente a 100 elementos. El total de elementos y páginas se calcula
     * con un segundo {@code COUNT} al repositorio.</p>
     *
     * <p>Ejemplo: {@code GET /api/cards?category=FLORES&maxPrice=20&page=0&size=12}</p>
     *
     * @param category  categoría para filtrar (nombre del enum, ej. {@code FLORES})
     * @param minPrice  precio mínimo inclusivo en soles
     * @param maxPrice  precio máximo inclusivo en soles
     * @param page      número de página 0-indexed (default 0)
     * @param size      tamaño de página, máximo 100 (default 100)
     * @return respuesta paginada {@link CardListResponse}
     */
    @GET
    public CardListResponse listCards(
            @QueryParam("category") String category,
            @QueryParam("minPrice") BigDecimal minPrice,
            @QueryParam("maxPrice") BigDecimal maxPrice,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("100") int size) {

        // Normalizar size (mín 1, máx 100)
        int safeSize = Math.min(Math.max(1, size), 100);
        int safePage = Math.max(0, page);

        // Convertir category String a enum solo si está presente
        CardCategory cardCategory = null;
        if (category != null && !category.isBlank()) {
            cardCategory = CardCategory.valueOf(category.toUpperCase());
        }

        CardFilters filters = new CardFilters(cardCategory, minPrice, maxPrice, safePage, safeSize);

        List<Tarjeta> tarjetas = tarjetaService.findAll(filters);
        long totalElements = tarjetaService.countAll(filters);

        List<CardSummaryDTO> content = tarjetas.stream()
                .map(CardSummaryDTO::from)
                .toList();

        return CardListResponse.of(content, totalElements, safePage, safeSize);
    }

    /**
     * Devuelve el detalle completo de una tarjeta por su UUID.
     *
     * <p>Incluye todas las imágenes ordenadas por {@code sortOrder} ascendente.</p>
     *
     * @param id UUID de la tarjeta
     * @return {@link CardDetailDTO} con todos los campos de la tarjeta
     * @throws jakarta.ws.rs.NotFoundException si no existe ninguna tarjeta con ese UUID (→ 404)
     */
    @GET
    @Path("/{id}")
    public CardDetailDTO getCard(@PathParam("id") UUID id) {
        Tarjeta tarjeta = tarjetaService.findById(id);
        return CardDetailDTO.from(tarjeta);
    }

    // =========================================================================
    // Endpoints de administración — requieren rol "admin"
    // =========================================================================

    /**
     * Crea una nueva tarjeta en el catálogo.
     *
     * <p>Requiere autenticación HTTP Basic con rol {@code admin}.
     * Retorna 201 Created con la URL canónica en el header {@code Location}
     * y el detalle completo de la tarjeta en el body.</p>
     *
     * @param request  datos de la nueva tarjeta (validados con Bean Validation)
     * @param uriInfo  info de la solicitud para construir la URI de Location
     * @return 201 con {@link CardDetailDTO} en el body
     */
    @POST
    @RolesAllowed("admin")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createCard(@Valid TarjetaCreateRequest request, @Context UriInfo uriInfo) {
        Tarjeta created = tarjetaService.create(request);
        CardDetailDTO dto = CardDetailDTO.from(created);
        URI location = uriInfo.getAbsolutePathBuilder()
                .path(created.id.toString())
                .build();
        return Response.created(location).entity(dto).build();
    }

    /**
     * Actualiza los campos editables de una tarjeta existente.
     *
     * <p>El número de catálogo ({@code catalogNumber}) es inmutable y no se modifica.
     * Requiere autenticación HTTP Basic con rol {@code admin}.</p>
     *
     * @param id      UUID de la tarjeta a actualizar
     * @param request datos actualizados (validados con Bean Validation)
     * @return 200 con {@link CardDetailDTO} actualizado
     */
    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    @Consumes(MediaType.APPLICATION_JSON)
    public CardDetailDTO updateCard(@PathParam("id") UUID id, @Valid TarjetaUpdateRequest request) {
        Tarjeta updated = tarjetaService.update(id, request);
        return CardDetailDTO.from(updated);
    }

    /**
     * Desactiva (soft-delete) una tarjeta del catálogo.
     *
     * <p>Marca {@code active = false}; la tarjeta deja de aparecer en el catálogo público
     * pero no se elimina físicamente de la base de datos.
     * Requiere autenticación HTTP Basic con rol {@code admin}.</p>
     *
     * @param id UUID de la tarjeta a desactivar
     * @return 200 con {@link DeactivateResponse} confirmando la operación
     */
    @PATCH
    @Path("/{id}/deactivate")
    @RolesAllowed("admin")
    public DeactivateResponse deactivateCard(@PathParam("id") UUID id) {
        tarjetaService.deactivate(id);
        return new DeactivateResponse(id, false, "Tarjeta desactivada exitosamente.");
    }
}
