package com.horaazul.service;

import com.horaazul.exception.CatalogNumberConflictException;
import com.horaazul.exception.InvalidPriceException;
import com.horaazul.model.Tarjeta;
import com.horaazul.repository.TarjetaRepository;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import net.jqwik.api.Assume;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.BigRange;
import net.jqwik.api.constraints.IntRange;
import net.jqwik.api.constraints.Scale;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests de propiedad (jqwik) de las reglas de negocio de {@link TarjetaService}.
 */
class TarjetaServicePropertiesTest {

    private static final Set<BigDecimal> VALID_PRICES = Set.of(
            new BigDecimal("15"), new BigDecimal("17"), new BigDecimal("20"), new BigDecimal("30"));

    // Feature: hora-azul-ecommerce, Propiedad 3: Rechazo de precios inválidos
    // Validates: Requirements 6.7
    @Property(tries = 500)
    void rechazaCualquierPrecioFueraDelConjuntoValido(
            @ForAll @BigRange(min = "-1000", max = "1000") @Scale(4) BigDecimal price) {
        Assume.that(VALID_PRICES.stream().noneMatch(valid -> valid.compareTo(price) == 0));

        TarjetaRepository repository = mock(TarjetaRepository.class);
        TarjetaService service = serviceWith(repository, new ArrayList<>());

        assertThrows(InvalidPriceException.class,
                () -> service.create(TarjetaServiceTest.createRequest(1, price.toPlainString())));
        verify(repository, never()).persist(any(Tarjeta.class));
    }

    // Feature: hora-azul-ecommerce, Propiedad 7: Unicidad de número de catálogo
    // Validates: Requirements 6.6
    @Property(tries = 200)
    void rechazaUnaSegundaTarjetaConElMismoCatalogNumber(
            @ForAll @IntRange(min = 1, max = 33) int catalogNumber) {
        List<Tarjeta> store = new ArrayList<>();
        TarjetaService service = serviceWith(mock(TarjetaRepository.class), store);

        assertDoesNotThrow(() -> service.create(TarjetaServiceTest.createRequest(catalogNumber, "15.00")));
        assertThrows(CatalogNumberConflictException.class,
                () -> service.create(TarjetaServiceTest.createRequest(catalogNumber, "30.00")));
    }

    /**
     * Crea un servicio cuyo repositorio simulado guarda las tarjetas en {@code store}
     * y responde a la búsqueda por {@code catalogNumber} sobre ese almacén.
     */
    @SuppressWarnings("unchecked")
    private static TarjetaService serviceWith(TarjetaRepository repository, List<Tarjeta> store) {
        doAnswer(invocation -> {
            Tarjeta tarjeta = invocation.getArgument(0);
            tarjeta.id = UUID.randomUUID();
            store.add(tarjeta);
            return null;
        }).when(repository).persist(any(Tarjeta.class));

        when(repository.find(eq("catalogNumber = ?1"), any(Object[].class))).thenAnswer(invocation -> {
            Integer catalogNumber = invocation.getArgument(1);
            PanacheQuery<Tarjeta> query = mock(PanacheQuery.class);
            when(query.list()).thenReturn(store.stream()
                    .filter(t -> t.catalogNumber.equals(catalogNumber))
                    .toList());
            return query;
        });

        TarjetaService service = new TarjetaService();
        service.tarjetaRepository = repository;
        return service;
    }
}
