package com.horaazul.resource;

import com.horaazul.dto.AdminCardDTO;
import com.horaazul.dto.AdminSessionDTO;
import com.horaazul.service.TarjetaService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

/**
 * Recurso JAX-RS con los endpoints propios del panel administrativo.
 *
 * <p>Todos requieren el rol {@code admin} y se autentican mediante HTTP Basic Auth.</p>
 *
 * <p>Validates: Requirements 10.12, 11.3</p>
 */
@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("admin")
public class AdminResource {

    @Inject
    SecurityIdentity identity;

    @Inject
    TarjetaService tarjetaService;

    /**
     * Permite al panel validar las credenciales antes de iniciar la sesión.
     *
     * @return 200 con el usuario autenticado; 401 si las credenciales no son válidas,
     *         sin indicar si falló el usuario o la contraseña
     */
    @GET
    @Path("/session")
    public AdminSessionDTO session() {
        return new AdminSessionDTO(identity.getPrincipal().getName());
    }

    /**
     * Lista todas las tarjetas, activas e inactivas, ordenadas por número de catálogo.
     *
     * <p>No se pagina: el catálogo es pequeño y el panel filtra en el cliente.</p>
     *
     * @return tarjetas del catálogo
     */
    @GET
    @Path("/cards")
    public List<AdminCardDTO> listCards() {
        return tarjetaService.findAllForAdmin().stream().map(AdminCardDTO::from).toList();
    }
}
