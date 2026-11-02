package com.horaazul.model;

/**
 * Tipo de imagen asociada a una tarjeta pop-up 3D.
 *
 * <ul>
 *   <li>{@link #COVER}    – Imagen de portada principal.</li>
 *   <li>{@link #OPEN}     – Imagen de la tarjeta desplegada (efecto pop-up visible).</li>
 *   <li>{@link #ENVELOPE} – Imagen del sobre incluido.</li>
 * </ul>
 */
public enum ImageType {
    COVER,
    OPEN,
    ENVELOPE
}
