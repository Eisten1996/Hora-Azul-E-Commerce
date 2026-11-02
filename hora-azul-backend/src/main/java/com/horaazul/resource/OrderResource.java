package com.horaazul.resource;

import com.horaazul.dto.OrderRequest;
import com.horaazul.dto.OrderResponse;
import com.horaazul.dto.OrderSummaryDTO;
import com.horaazul.repository.OrdenRepository;
import com.horaazul.service.OrderService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.net.URI;
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
     * Devuelve el listado de todas las órdenes ordenadas por fecha de creación
     * descendente (la más reciente primero).
     *
     * <p>Requiere autenticación HTTP Basic con rol {@code admin}.
     * Cada elemento es un {@link OrderSummaryDTO} con el total calculado.</p>
     *
     * @return 200 con lista de resúmenes de órdenes
     */
    @GET
    @RolesAllowed("admin")
    @Transactional
    public List<OrderSummaryDTO> listOrders() {
        return ordenRepository.findAllOrderedByCreatedAtDesc().stream()
                .map(OrderSummaryDTO::from)
                .toList();
    }

    /**
     * Devuelve el detalle completo de una orden identificada por su código único.
     *
     * <p>Requiere autenticación HTTP Basic con rol {@code admin}.
     * Si no existe ninguna orden con ese código retorna 404.</p>
     *
     * @param orderCode código de orden en formato {@code ORD-YYYY-XXXX}
     * @return 200 con {@link OrderResponse} completo incluyendo todos los ítems,
     *         o 404 si no se encuentra la orden
     */
    @GET
    @Path("/{orderCode}")
    @RolesAllowed("admin")
    @Transactional
    public Response getOrder(@PathParam("orderCode") String orderCode) {
        return ordenRepository.findByOrderCode(orderCode)
                .map(orden -> {
                    // Inicializar la colección lazy dentro de la transacción activa
                    orden.items.size();
                    return Response.ok(OrderResponse.fromEntity(orden)).build();
                })
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }
}
