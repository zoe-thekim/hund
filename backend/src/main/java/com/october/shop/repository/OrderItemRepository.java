package com.october.shop.repository;

import com.october.shop.model.Order;
import com.october.shop.model.OrderItem;
import com.october.shop.model.Product;
import com.october.shop.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 특정 주문의 아이템 조회
    List<OrderItem> findByOrder(Order order);

    // 특정 상품의 주문 아이템 조회
    List<OrderItem> findByProduct(Product product);

    // 특정 재고의 주문 아이템 조회
    List<OrderItem> findByInventory(Inventory inventory);

    // 특정 주문의 특정 상품 아이템 조회
    List<OrderItem> findByOrderAndProduct(Order order, Product product);

    // 특정 상태의 주문 아이템 조회
    List<OrderItem> findByItemStatus(OrderItem.ItemStatus itemStatus);

    // 특정 주문의 총 아이템 수량 조회
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.order = :order")
    Integer getTotalQuantityByOrder(@Param("order") Order order);

    // 특정 주문의 총 가격 조회
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.order = :order")
    Integer getTotalPriceByOrder(@Param("order") Order order);

    // 특정 상품의 총 판매 수량 조회
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product = :product AND oi.itemStatus IN ('DELIVERED', 'CONFIRMED')")
    Integer getTotalSoldQuantityByProduct(@Param("product") Product product);

    // 특정 상품의 총 매출액 조회
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.product = :product AND oi.itemStatus IN ('DELIVERED', 'CONFIRMED')")
    Integer getTotalRevenueByProduct(@Param("product") Product product);
}