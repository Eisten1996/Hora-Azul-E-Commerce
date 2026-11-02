package com.horaazul.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa una orden de compra en Hora Azul.
 *
 * <p>El código de orden ({@code orderCode}) sigue el formato {@code ORD-YYYY-XXXX}
 * y es único en el sistema. El estado inicial es {@link OrderStatus#PENDING_PAYMENT},
 * en espera de que el equipo confirme el pago vía WhatsApp.</p>
 *
 * <p>Validates: Requirements 5.7, 7.1</p>
 */
@Entity
@Table(name = "orden")
public class Orden extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(name = "order_code", unique = true, nullable = false, length = 20)
    public String orderCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Column(name = "customer_name", nullable = false, length = 100)
    public String customerName;

    @Column(name = "customer_phone", nullable = false, length = 9)
    public String customerPhone;

    @Column(name = "delivery_address", nullable = false, length = 200)
    public String deliveryAddress;

    @Column(name = "estimated_delivery_date", nullable = false)
    public LocalDate estimatedDeliveryDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<OrdenItem> items = new ArrayList<>();

    /**
     * Establece la marca de tiempo antes de la primera persistencia.
     */
    @PrePersist
    void onPrePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
