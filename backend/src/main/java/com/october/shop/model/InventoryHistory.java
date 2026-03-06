package com.october.shop.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType transactionType;

    @Column(name = "quantity_change")
    private Integer quantityChange;

    @Column(name = "quantity_before")
    private Integer quantityBefore;

    @Column(name = "quantity_after")
    private Integer quantityAfter;

    @Column(name = "reference_type", length = 50)
    private String referenceType; // ORDER, RESTOCK, ADJUSTMENT, RETURN

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by", length = 100)
    private String createdBy; // 변동을 수행한 사용자 또는 시스템

    public enum TransactionType {
        SALE,           // 판매로 인한 재고 감소
        RETURN,         // 반품으로 인한 재고 증가
        RESTOCK,        // 입고로 인한 재고 증가
        ADJUSTMENT,     // 재고 조정
        RESERVE,        // 재고 예약
        RELEASE,        // 예약 해제
        DAMAGED,        // 파손으로 인한 재고 감소
        EXPIRED         // 유통기한 만료로 인한 재고 감소
    }
}