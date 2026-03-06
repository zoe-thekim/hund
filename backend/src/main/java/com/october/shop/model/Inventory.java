package com.october.shop.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory",
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "size"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @Column(length = 10)
    private String size;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "reserved_quantity")
    private Integer reservedQuantity = 0;

    @Column(name = "available_quantity")
    private Integer availableQuantity = 0;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 5;

    @Column(name = "restock_point")
    private Integer restockPoint = 10;

    @Column(name = "last_restocked_at")
    private LocalDateTime lastRestockedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateAvailableQuantity();
    }

    @PrePersist
    public void prePersist() {
        updateAvailableQuantity();
    }

    private void updateAvailableQuantity() {
        this.availableQuantity = this.stockQuantity - this.reservedQuantity;
        if (this.availableQuantity < 0) {
            this.availableQuantity = 0;
        }
    }

    // 재고 감소 메소드
    public boolean reduceStock(Integer quantity) {
        if (this.availableQuantity >= quantity) {
            this.stockQuantity -= quantity;
            updateAvailableQuantity();
            return true;
        }
        return false;
    }

    // 재고 예약 메소드
    public boolean reserveStock(Integer quantity) {
        if (this.availableQuantity >= quantity) {
            this.reservedQuantity += quantity;
            updateAvailableQuantity();
            return true;
        }
        return false;
    }

    // 재고 예약 해제 메소드
    public void releaseReservedStock(Integer quantity) {
        this.reservedQuantity -= quantity;
        if (this.reservedQuantity < 0) {
            this.reservedQuantity = 0;
        }
        updateAvailableQuantity();
    }

    // 예약된 재고를 실제 재고에서 차감
    public boolean confirmReservedStock(Integer quantity) {
        if (this.reservedQuantity >= quantity) {
            this.reservedQuantity -= quantity;
            this.stockQuantity -= quantity;
            updateAvailableQuantity();
            return true;
        }
        return false;
    }

    // 재고 보충 메소드
    public void addStock(Integer quantity) {
        this.stockQuantity += quantity;
        this.lastRestockedAt = LocalDateTime.now();
        updateAvailableQuantity();
    }

    // 재고 부족 여부 확인
    public boolean isLowStock() {
        return this.availableQuantity <= this.lowStockThreshold;
    }

    // 재주문이 필요한지 확인
    public boolean needsRestock() {
        return this.availableQuantity <= this.restockPoint;
    }
}
