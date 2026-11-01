package com.horaazul.resource;

import com.horaazul.dto.CardDetailDTO;
import com.horaazul.dto.CardFilters;
import com.horaazul.dto.CardListResponse;
import com.horaazul.dto.CardSummaryDTO;
import com.horaazul.model.CardCategory;
import com.horaazul.model.Tarjeta;
import com.horaazul.service.TarjetaService;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Recurso JAX-RS que expone los endpoints públicos del catálogo de tarjetas.
 *
 * <p>Los endpoints de administración (POST, PUT, PATCH) se definen por separado
 * con {@code @RolesAllowed("admin")} y se añadirán en la tarea 3.3.</p>
 *
 * <p>Validates: Requirements 1.2, 1.3, 3.2, 6.4, 6.5</p>
 */
@Path("/api/cards")
@Produces(MediaType.APPLICATION_JSON)
public class TarjetaResource {

    @Inject
    TarjetaService tarjetaService;

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
}
