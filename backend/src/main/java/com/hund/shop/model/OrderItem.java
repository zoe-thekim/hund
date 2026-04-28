package com.hund.shop.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @Column(name = "product_name", length = 200)
    private String productName; // 주문 시점의 상품명

    @Column(nullable = false, length = 10)
    private String size;

    @Column(nullable = false)
    private Integer price; // 주문 시점의 단가(legacy 호환 컬럼)

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price")
    private Integer unitPrice; // 주문 시점의 단가

    @Column(name = "total_price")
    private Integer totalPrice; // quantity * unitPrice

    @Column(name = "discount_amount")
    private Integer discountAmount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_status")
    private ItemStatus itemStatus = ItemStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        calculateTotalPrice();
    }

    private void calculateTotalPrice() {
        final Integer safeUnitPrice = this.unitPrice != null ? this.unitPrice : this.price;
        final Integer safeQuantity = this.quantity != null ? this.quantity : 0;
        final int unitPriceValue = safeUnitPrice != null ? safeUnitPrice : 0;
        final int discount = this.discountAmount != null ? this.discountAmount : 0;
        final int quantityValue = safeQuantity != null ? safeQuantity : 0;

        this.unitPrice = unitPriceValue;
        this.price = this.price != null ? this.price : unitPriceValue;
        this.totalPrice = (unitPriceValue * quantityValue) - discount;
    }

    public void recalculatePrice() {
        calculateTotalPrice();
    }

    public enum ItemStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        RETURNED,
        REFUNDED
    }
}
