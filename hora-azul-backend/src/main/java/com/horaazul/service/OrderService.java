package com.horaazul.service;

import com.horaazul.dto.OrderItemDTO;
import com.horaazul.dto.OrderRequest;
import com.horaazul.dto.OrderRequestItem;
import com.horaazul.dto.OrderResponse;
import com.horaazul.model.Orden;
import com.horaazul.model.OrdenItem;
import com.horaazul.model.OrderStatus;
import com.horaazul.model.Tarjeta;
import com.horaazul.repository.OrdenRepository;
import com.horaazul.repository.TarjetaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la creación y consulta de órdenes de compra.
 *
 * <p>Responsabilidades principales:
 * <ul>
 *   <li>Resolver cada UUID de tarjeta del carrito a su entidad {@link Tarjeta}.</li>
 *   <li>Capturar un snapshot de {@code catalogNumber}, {@code name} y {@code price}
 *       en el momento de la orden, independiente de cambios futuros en el catálogo.</li>
 *   <li>Calcular subtotales ({@code unitPrice × quantity}) y el total general.</li>
 *   <li>Obtener un código único llamando a {@link OrderCodeGenerator#generateNext()}
 *       dentro de la misma transacción.</li>
 *   <li>Persistir {@link Orden} e {@link OrdenItem} en la base de datos.</li>
 * </ul>
 * </p>
 *
 * <p>Validates: Requirements 5.6, 5.7, 7.1, 11.13</p>
 */
@ApplicationScoped
public class OrderService {

    @Inject
    TarjetaRepository tarjetaRepository;

    @Inject
    OrdenRepository ordenRepository;

    @Inject
    OrderCodeGenerator orderCodeGenerator;

    // -------------------------------------------------------------------------
    // Métodos públicos
    // -------------------------------------------------------------------------

    /**
     * Crea una nueva orden de compra a partir de los datos del carrito.
     *
     * <p>El método ejecuta todo el proceso dentro de una única transacción:
     * resolución de tarjetas, cálculo de totales, generación de código y
     * persistencia. Si alguna tarjeta no existe o está inactiva, se lanza
     * {@link NotFoundException} y toda la transacción hace rollback.</p>
     *
     * @param request datos del cliente y lista de ítems del carrito
     * @return {@link OrderResponse} con el código generado, totales y detalle de ítems
     * @throws BadRequestException si el carrito no tiene ítems
     * @throws NotFoundException   si alguna tarjeta no existe o está inactiva
     */
    @Transactional
    public OrderResponse create(OrderRequest request) {

        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("El carrito no puede estar vacío.");
        }

        // 1. Resolver cada ítem del carrito a su entidad Tarjeta
        //    y capturar el snapshot de datos en ese momento
        List<OrdenItem> itemEntities = new ArrayList<>();
        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderRequestItem requestItem : request.items()) {
            Tarjeta tarjeta = resolveOrThrow(requestItem.tarjetaId());

            // Snapshot: copiar datos del catálogo al momento de la compra
            OrdenItem ordenItem = new OrdenItem();
            ordenItem.tarjeta = tarjeta;
            ordenItem.catalogNumber = tarjeta.catalogNumber;
            ordenItem.cardName = tarjeta.name;
            ordenItem.unitPrice = tarjeta.price;
            ordenItem.quantity = requestItem.quantity();

            // Calcular subtotal de este ítem
            BigDecimal subtotal = tarjeta.price.multiply(BigDecimal.valueOf(requestItem.quantity()));
            totalAmount = totalAmount.add(subtotal);

            itemEntities.add(ordenItem);
            itemDTOs.add(new OrderItemDTO(
                    tarjeta.catalogNumber,
                    tarjeta.name,
                    tarjeta.price,
                    requestItem.quantity(),
                    subtotal
            ));
        }

        // 2. Generar el código único dentro de la misma transacción
        //    (OrderCodeGenerator requiere @Transactional MANDATORY, que se hereda aquí)
        String orderCode = orderCodeGenerator.generateNext();

        // 3. Crear y persistir la entidad Orden
        Orden orden = new Orden();
        orden.orderCode = orderCode;
        orden.status = OrderStatus.PENDING_PAYMENT;
        orden.customerName = request.customerName();
        orden.customerPhone = request.customerPhone();
        orden.deliveryAddress = request.deliveryAddress();
        orden.estimatedDeliveryDate = request.estimatedDeliveryDate();

        ordenRepository.persist(orden);

        // 4. Persistir cada OrdenItem asociado a la Orden
        for (OrdenItem item : itemEntities) {
            item.orden = orden;
            item.persist();
            orden.items.add(item);
        }

        // 5. Construir y retornar la respuesta
        return OrderResponse.from(orden, itemDTOs, totalAmount);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    /**
     * Busca una tarjeta que se pueda comprar o lanza {@link NotFoundException}.
     *
     * @param tarjetaId UUID de la tarjeta a resolver
     * @return entidad {@link Tarjeta} activa
     * @throws NotFoundException si la tarjeta no existe o está inactiva
     */
    private Tarjeta resolveOrThrow(UUID tarjetaId) {
        return tarjetaRepository.findByIdOptional(tarjetaId)
                .filter(tarjeta -> tarjeta.active)
                .orElseThrow(() -> new NotFoundException(
                        "No se encontró ninguna tarjeta disponible con id: " + tarjetaId));
    }
}
