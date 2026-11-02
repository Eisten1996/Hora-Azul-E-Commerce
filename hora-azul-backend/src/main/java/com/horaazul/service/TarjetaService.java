package com.horaazul.service;

import com.horaazul.dto.CardFilters;
import com.horaazul.dto.ImageRequest;
import com.horaazul.dto.TarjetaCreateRequest;
import com.horaazul.dto.TarjetaUpdateRequest;
import com.horaazul.exception.CatalogNumberConflictException;
import com.horaazul.exception.InvalidPriceException;
import com.horaazul.model.CardImage;
import com.horaazul.model.Tarjeta;
import com.horaazul.repository.TarjetaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Servicio de negocio para la gestión del catálogo de tarjetas pop-up 3D.
 *
 * <p>Encapsula las reglas de negocio del catálogo:
 * <ul>
 *   <li>El precio debe pertenecer a {15.00, 17.00, 20.00, 30.00}.</li>
 *   <li>El número de catálogo es único e inmutable tras la creación.</li>
 *   <li>La desactivación es lógica (soft delete): {@code active = false}.</li>
 * </ul>
 * </p>
 *
 * <p>Validates: Requirements 6.1, 6.2, 6.3, 6.6, 6.7, 6.8, 6.9</p>
 */
@ApplicationScoped
public class TarjetaService {

    /** Conjunto de precios válidos según el modelo de negocio de Hora Azul. */
    private static final Set<BigDecimal> VALID_PRICES = Set.of(
            new BigDecimal("15.00"),
            new BigDecimal("17.00"),
            new BigDecimal("20.00"),
            new BigDecimal("30.00")
    );

    @Inject
    TarjetaRepository tarjetaRepository;

    // -------------------------------------------------------------------------
    // Métodos públicos
    // -------------------------------------------------------------------------

    /**
     * Crea y persiste una nueva tarjeta con sus imágenes.
     *
     * @param request datos de la nueva tarjeta
     * @return la entidad {@link Tarjeta} persistida con su UUID asignado
     * @throws InvalidPriceException           si el precio no pertenece a los valores permitidos
     * @throws CatalogNumberConflictException si ya existe una tarjeta con ese número de catálogo
     */
    @Transactional
    public Tarjeta create(TarjetaCreateRequest request) {
        validatePrice(request.price());
        verifyCatalogNumberUniqueness(request.catalogNumber(), null);

        Tarjeta tarjeta = new Tarjeta();
        tarjeta.catalogNumber = request.catalogNumber();
        tarjeta.name = request.name();
        tarjeta.category = request.category();
        tarjeta.price = normalizePrice(request.price());
        tarjeta.dimensions = request.dimensions();
        tarjeta.description3d = request.description3d();
        tarjeta.envelopeIncluded = request.envelopeIncluded();
        tarjeta.active = true;

        tarjetaRepository.persist(tarjeta);

        if (request.images() != null) {
            for (ImageRequest imageRequest : request.images()) {
                CardImage image = buildCardImage(imageRequest, tarjeta);
                image.persist();
                tarjeta.images.add(image);
            }
        }

        return tarjeta;
    }

    /**
     * Actualiza los campos modificables de una tarjeta existente.
     * El {@code catalogNumber} es inmutable y no se modifica.
     *
     * @param id      UUID de la tarjeta a actualizar
     * @param request datos actualizados
     * @return la entidad {@link Tarjeta} modificada
     * @throws NotFoundException     si no existe ninguna tarjeta con el UUID indicado
     * @throws InvalidPriceException si el nuevo precio no pertenece a los valores permitidos
     */
    @Transactional
    public Tarjeta update(UUID id, TarjetaUpdateRequest request) {
        Tarjeta tarjeta = findExistingById(id);
        validatePrice(request.price());

        tarjeta.name = request.name();
        tarjeta.category = request.category();
        tarjeta.price = normalizePrice(request.price());
        tarjeta.dimensions = request.dimensions();
        tarjeta.description3d = request.description3d();
        tarjeta.envelopeIncluded = request.envelopeIncluded();

        if (request.images() != null) {
            // Eliminar imágenes existentes y reemplazarlas por las nuevas
            for (CardImage existing : tarjeta.images) {
                existing.delete();
            }
            tarjeta.images.clear();

            for (ImageRequest imageRequest : request.images()) {
                CardImage image = buildCardImage(imageRequest, tarjeta);
                image.persist();
                tarjeta.images.add(image);
            }
        }

        return tarjeta;
    }

    /**
     * Desactiva (soft-delete) una tarjeta poniendo {@code active = false}.
     *
     * @param id UUID de la tarjeta a desactivar
     * @throws NotFoundException si no existe ninguna tarjeta con el UUID indicado
     */
    @Transactional
    public void deactivate(UUID id) {
        Tarjeta tarjeta = findExistingById(id);
        tarjeta.active = false;
    }

    /**
     * Retorna la lista de tarjetas activas con los filtros dados.
     *
     * <p>Las imágenes se inicializan dentro de la transacción porque
     * {@code CardSummaryDTO} las lee para obtener la portada.</p>
     *
     * @param filters filtros de categoría, precio y paginación
     * @return lista de {@link Tarjeta} que cumplen los criterios
     */
    @Transactional
    public List<Tarjeta> findAll(CardFilters filters) {
        CardFilters safe = filters != null ? filters : CardFilters.empty();
        List<Tarjeta> tarjetas = tarjetaRepository.findActive(
                safe.category(),
                safe.minPrice(),
                safe.maxPrice(),
                safe.page(),
                safe.size()
        ).list();
        // Inicializar colecciones lazy dentro de la transacción activa
        tarjetas.forEach(t -> t.images.size());
        return tarjetas;
    }

    /**
     * Cuenta el total de tarjetas activas que coinciden con los filtros dados,
     * sin aplicar paginación. Útil para calcular {@code totalElements} y
     * {@code totalPages} en la respuesta paginada.
     *
     * @param filters filtros de categoría y precio (paginación ignorada)
     * @return número total de tarjetas activas que cumplen los criterios
     */
    @Transactional
    public long countAll(CardFilters filters) {
        CardFilters safe = filters != null ? filters : CardFilters.empty();
        return tarjetaRepository.countActive(
                safe.category(),
                safe.minPrice(),
                safe.maxPrice()
        );
    }

    /**
     * Busca una tarjeta por su UUID retornando el detalle completo con imágenes.
     *
     * <p>Las imágenes se cargan inicializando la colección lazy dentro de la misma
     * transacción para evitar {@code LazyInitializationException} al serializar.</p>
     *
     * @param id UUID de la tarjeta
     * @return la entidad {@link Tarjeta} con su colección de imágenes inicializada
     * @throws NotFoundException si no existe ninguna tarjeta con el UUID indicado
     */
    @Transactional
    public Tarjeta findById(UUID id) {
        Tarjeta tarjeta = findExistingById(id);
        // Inicializar colección lazy dentro de la transacción activa
        tarjeta.images.size();
        return tarjeta;
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    /**
     * Valida que el precio pertenezca al conjunto de precios permitidos.
     * Normaliza a 2 decimales antes de comparar para que 15 == 15.00.
     * Un precio con más de 2 decimales significativos (ej. 15.001) es inválido.
     */
    private void validatePrice(BigDecimal price) {
        if (price == null) {
            throw new InvalidPriceException(null);
        }
        BigDecimal normalized;
        try {
            normalized = normalizePrice(price);
        } catch (ArithmeticException e) {
            throw new InvalidPriceException(price);
        }
        if (!VALID_PRICES.contains(normalized)) {
            throw new InvalidPriceException(price);
        }
    }

    /**
     * Escala el precio a 2 decimales para comparaciones consistentes.
     */
    private BigDecimal normalizePrice(BigDecimal price) {
        return price.setScale(2, java.math.RoundingMode.UNNECESSARY);
    }

    /**
     * Verifica que no exista otra tarjeta con el mismo número de catálogo.
     *
     * @param catalogNumber número a verificar
     * @param excludeId     UUID a excluir de la búsqueda (para actualizaciones; {@code null} en crear)
     */
    private void verifyCatalogNumberUniqueness(Integer catalogNumber, UUID excludeId) {
        List<Tarjeta> existing = tarjetaRepository
                .find("catalogNumber = ?1", catalogNumber)
                .list();

        boolean conflict = existing.stream()
                .anyMatch(t -> excludeId == null || !t.id.equals(excludeId));

        if (conflict) {
            throw new CatalogNumberConflictException(catalogNumber);
        }
    }

    /**
     * Busca una tarjeta por UUID o lanza {@link NotFoundException}.
     */
    private Tarjeta findExistingById(UUID id) {
        return tarjetaRepository.findByIdOptional(id)
                .orElseThrow(() ->
                        new NotFoundException("No se encontró ninguna tarjeta con id: " + id));
    }

    /**
     * Construye una entidad {@link CardImage} a partir del DTO y la tarjeta padre.
     */
    private CardImage buildCardImage(ImageRequest req, Tarjeta tarjeta) {
        CardImage image = new CardImage();
        image.url = req.url();
        image.sortOrder = req.sortOrder();
        image.imageType = req.imageType();
        image.tarjeta = tarjeta;
        return image;
    }
}
