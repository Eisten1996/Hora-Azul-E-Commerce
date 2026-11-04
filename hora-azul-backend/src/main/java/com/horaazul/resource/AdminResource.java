package com.horaazul.resource;

import com.horaazul.dto.AdminSessionDTO;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * Recurso JAX-RS con los endpoints propios del panel administrativo.
 *
 * <p>Todos requieren el rol {@code admin} y se autentican mediante HTTP Basic Auth.</p>
 *
 * <p>Validates: Requirements 10.12</p>
 */
@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("admin")
public class AdminResource {

    @Inject
    SecurityIdentity identity;

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
}
