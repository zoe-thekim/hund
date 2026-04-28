package com.hund.shop.repository;

import com.hund.shop.model.Inventory;
import com.hund.shop.model.InventoryHistory;
import com.hund.shop.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {

    // 특정 재고의 이력 조회
    List<InventoryHistory> findByInventoryOrderByCreatedAtDesc(Inventory inventory);

    // 특정 주문 아이템의 이력 조회
    List<InventoryHistory> findByOrderItemOrderByCreatedAtDesc(OrderItem orderItem);

    // 특정 거래 유형의 이력 조회
    List<InventoryHistory> findByTransactionTypeOrderByCreatedAtDesc(InventoryHistory.TransactionType transactionType);

    // 특정 기간의 이력 조회
    @Query("SELECT ih FROM InventoryHistory ih WHERE ih.createdAt BETWEEN :startDate AND :endDate ORDER BY ih.createdAt DESC")
    List<InventoryHistory> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 특정 재고의 특정 기간 이력 조회
    @Query("SELECT ih FROM InventoryHistory ih WHERE ih.inventory = :inventory AND ih.createdAt BETWEEN :startDate AND :endDate ORDER BY ih.createdAt DESC")
    List<InventoryHistory> findByInventoryAndCreatedAtBetween(@Param("inventory") Inventory inventory, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 특정 참조 타입과 ID로 이력 조회
    List<InventoryHistory> findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(String referenceType, Long referenceId);

    // 특정 생성자의 이력 조회
    List<InventoryHistory> findByCreatedByOrderByCreatedAtDesc(String createdBy);
}