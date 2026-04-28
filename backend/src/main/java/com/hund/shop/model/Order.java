package com.hund.shop.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount")
    private Integer totalAmount;

    @Column(name = "shipping_fee")
    private Integer shippingFee = 0;

    @Column(name = "discount_amount")
    private Integer discountAmount = 0;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_key", length = 255)
    private String paymentKey;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "postalCode", column = @Column(name = "delivery_postal_code")),
        @AttributeOverride(name = "address", column = @Column(name = "delivery_address")),
        @AttributeOverride(name = "detailAddress", column = @Column(name = "delivery_detail_address"))
    })
    private Address deliveryAddress;

    @Column(name = "delivery_message", length = 500)
    private String deliveryMessage;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "ordered_at")
    private LocalDateTime orderedAt = LocalDateTime.now();

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;

    @PrePersist
    public void prePersist() {
        if (orderNumber == null) {
            orderNumber = generateOrderNumber();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    private String generateOrderNumber() {
        return "ORD-" + LocalDateTime.now().getYear()
               + String.format("%02d", LocalDateTime.now().getMonthValue())
               + String.format("%02d", LocalDateTime.now().getDayOfMonth())
               + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public enum OrderStatus {
        PENDING,        // 주문 대기
        CONFIRMED,      // 주문 확인
        PROCESSING,     // 상품 준비 중
        SHIPPED,        // 배송 중
        DELIVERED,      // 배송 완료
        CANCELLED,      // 주문 취소
        REFUNDED        // 환불 완료
    }

    public enum PaymentStatus {
        PENDING,        // 결제 대기
        COMPLETED,      // 결제 완료
        FAILED,         // 결제 실패
        CANCELLED,      // 결제 취소
        REFUNDED        // 환불 완료
    }
}
