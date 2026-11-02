package com.horaazul.service;

import com.horaazul.dto.TarjetaCreateRequest;
import com.horaazul.dto.TarjetaUpdateRequest;
import com.horaazul.exception.CatalogNumberConflictException;
import com.horaazul.exception.InvalidPriceException;
import com.horaazul.model.CardCategory;
import com.horaazul.model.Tarjeta;
import com.horaazul.repository.TarjetaRepository;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitarios de {@link TarjetaService} con el repositorio simulado.
 *
 * <p>Validates: Requirements 6.6, 6.7</p>
 */
class TarjetaServiceTest {

    private TarjetaRepository tarjetaRepository;
    private TarjetaService service;

    @BeforeEach
    void setUp() {
        tarjetaRepository = mock(TarjetaRepository.class);
        service = new TarjetaService();
        service.tarjetaRepository = tarjetaRepository;
    }

    // -------------------------------------------------------------------------
    // create
    // -------------------------------------------------------------------------

    @Test
    void createConPrecioValidoPersisteLaTarjeta() {
        givenExistingWithCatalogNumber();

        Tarjeta created = service.create(createRequest(12, "20"));

        assertEquals(12, created.catalogNumber);
        assertEquals(new BigDecimal("20.00"), created.price);
        assertTrue(created.active);
        verify(tarjetaRepository).persist(any(Tarjeta.class));
    }

    @Test
    void createConPrecioInvalidoLanzaInvalidPriceException() {
        givenExistingWithCatalogNumber();

        assertThrows(InvalidPriceException.class,
                () -> service.create(createRequest(12, "25.00")));
        verify(tarjetaRepository, never()).persist(any(Tarjeta.class));
    }

    @Test
    void createConCatalogNumberDuplicadoLanzaCatalogNumberConflictException() {
        Tarjeta existing = new Tarjeta();
        existing.id = UUID.randomUUID();
        existing.catalogNumber = 12;
        givenExistingWithCatalogNumber(existing);

        assertThrows(CatalogNumberConflictException.class,
                () -> service.create(createRequest(12, "15.00")));
        verify(tarjetaRepository, never()).persist(any(Tarjeta.class));
    }

    // -------------------------------------------------------------------------
    // update
    // -------------------------------------------------------------------------

    @Test
    void updateTarjetaExistenteConservaElCatalogNumber() {
        UUID id = UUID.randomUUID();
        Tarjeta existing = new Tarjeta();
        existing.id = id;
        existing.catalogNumber = 7;
        existing.name = "Nombre original";
        existing.price = new BigDecimal("15.00");
        when(tarjetaRepository.findByIdOptional(id)).thenReturn(Optional.of(existing));

        Tarjeta updated = service.update(id, new TarjetaUpdateRequest(
                "Nombre nuevo", CardCategory.AMOR, new BigDecimal("30"),
                "15 x 20 cm", "Corazón en relieve", true, null));

        assertEquals(7, updated.catalogNumber);
        assertEquals("Nombre nuevo", updated.name);
        assertEquals(CardCategory.AMOR, updated.category);
        assertEquals(new BigDecimal("30.00"), updated.price);
    }

    @Test
    void updateTarjetaInexistenteLanzaNotFoundException() {
        UUID id = UUID.randomUUID();
        when(tarjetaRepository.findByIdOptional(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.update(id, new TarjetaUpdateRequest(
                "Nombre", CardCategory.AMOR, new BigDecimal("15.00"), null, null, true, null)));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private void givenExistingWithCatalogNumber(Tarjeta... existing) {
        PanacheQuery<Tarjeta> query = mock(PanacheQuery.class);
        when(query.list()).thenReturn(List.of(existing));
        when(tarjetaRepository.find(eq("catalogNumber = ?1"), any(Object[].class))).thenReturn(query);
    }

    static TarjetaCreateRequest createRequest(int catalogNumber, String price) {
        return new TarjetaCreateRequest(
                catalogNumber,
                "Tarjeta de prueba " + catalogNumber,
                CardCategory.FLORES,
                new BigDecimal(price),
                "15 x 20 cm",
                "Flores que emergen al abrir la tarjeta.",
                true,
                List.of());
    }
}
