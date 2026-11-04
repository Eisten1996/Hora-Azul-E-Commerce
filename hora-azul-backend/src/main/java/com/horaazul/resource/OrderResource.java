package com.horaazul.resource;

import com.horaazul.dto.OrderDetailDTO;
import com.horaazul.dto.OrderListResponse;
import com.horaazul.dto.OrderRequest;
import com.horaazul.dto.OrderResponse;
import com.horaazul.dto.OrderStatusRequest;
import com.horaazul.dto.OrderSummaryDTO;
import com.horaazul.model.Orden;
import com.horaazul.model.OrderStatus;
import com.horaazul.repository.OrdenRepository;
import com.horaazul.service.OrderService;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.net.URI;
import java.util.Arrays;
import java.util.List;

/**
 * Recurso JAX-RS que expone los endpoints REST de órdenes de compra.
 *
 * <p>El endpoint de creación ({@code POST}) es público: cualquier cliente
 * del frontend puede enviar un pedido sin autenticación.</p>
 *
 * <p>Los endpoints de consulta ({@code GET}) requieren el rol {@code admin}
 * y se protegen con HTTP Basic Auth.</p>
 *
 * <p>Validates: Requirements 5.6, 5.9, 7.1, 7.2, 7.3, 7.4</p>
 */
@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
public class OrderResource {

    @Inject
    OrderService orderService;

    @Inject
    OrdenRepository ordenRepository;

    // =========================================================================
    // Endpoint público — creación de orden
    // =========================================================================

    /**
     * Crea una nueva orden de compra con los datos del carrito del cliente.
     *
     * <p>Endpoint público: no requiere autenticación. Valida el cuerpo de la
     * petición con Bean Validation ({@code @Valid}) antes de invocar el servicio.
     * En caso de éxito retorna 201 con la URL de la orden en el header
     * {@code Location} y el detalle completo en el body.</p>
     *
     * @param request datos del cliente y lista de ítems del carrito (validados)
     * @param uriInfo info de la solicitud para construir la URI de Location
     * @return 201 Created con {@link OrderResponse} en el body
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createOrder(@Valid OrderRequest request, @Context UriInfo uriInfo) {
        OrderResponse orderResponse = orderService.create(request);
        URI location = uriInfo.getAbsolutePathBuilder()
                .path(orderResponse.orderCode())
                .build();
        return Response.created(location).entity(orderResponse).build();
    }

    // =========================================================================
    // Endpoints de administración — requieren rol "admin"
    // =========================================================================

    /**
     * Devuelve una página de órdenes, de la más reciente a la más antigua.
     *
     * <p>Requiere autenticación HTTP Basic con rol {@code admin}.</p>
     *
     * <p>Validates: Requirements 12.1, 12.2, 12.11</p>
     *
     * @param status estado por el que filtrar; vacío para todas
     * @param page   número de página 0-indexed (default 0)
     * @param size   tamaño de página, máximo 100 (default 20)
     * @return 200 con la página, o 400 si el estado no existe
     */
    @GET
    @RolesAllowed("admin")
    @Transactional
    public OrderListResponse listOrders(
            @QueryParam("status") String status,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);

        PanacheQuery<Orden> query = ordenRepository.findPage(parseStatus(status), safePage, safeSize);
        List<OrderSummaryDTO> content = query.list().stream()
                .map(OrderSummaryDTO::from)
                .toList();

        return new OrderListResponse(content, safePage, safeSize, query.count(), query.pageCount());
    }

    /**
     * Devuelve el detalle completo de una orden identificada por su código único.
     *
     * <p>Requiere autenticación HTTP Basic con rol {@code admin}.
     * Si no existe ninguna orden con ese código retorna 404.</p>
     *
     * <p>Validates: Requirements 12.3, 12.11</p>
     *
     * @param orderCode código de orden en formato {@code ORD-YYYY-XXXX}
     * @return 200 con {@link OrderDetailDTO}, o 404 si no se encuentra la orden
     */
    @GET
    @Path("/{orderCode}")
    @RolesAllowed("admin")
    @Transactional
    public Response getOrder(@PathParam("orderCode") String orderCode) {
        return ordenRepository.findByOrderCode(orderCode)
                .map(orden -> Response.ok(OrderDetailDTO.from(orden)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    /**
     * Cambia el estado de una orden.
     *
     * <p>Validates: Requirements 12.4, 12.5, 12.11</p>
     *
     * @param orderCode código de orden en formato {@code ORD-YYYY-XXXX}
     * @param request   estado solicitado
     * @return 200 con el detalle de la orden, 404 si no existe, 409 si el cambio no está
     *         permitido y 422 si falta el estado
     */
    @PATCH
    @Path("/{orderCode}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    public OrderDetailDTO changeStatus(
            @PathParam("orderCode") String orderCode,
            @Valid @NotNull OrderStatusRequest request) {
        return orderService.changeStatus(orderCode, request.status());
    }

    private static OrderStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return OrderStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("El estado '" + status + "' no existe. Valores válidos: "
                    + Arrays.toString(OrderStatus.values()) + ".");
        }
    }
}
