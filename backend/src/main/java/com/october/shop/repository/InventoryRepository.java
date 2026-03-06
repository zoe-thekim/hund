package com.october.shop.repository;

import com.october.shop.model.Inventory;
import com.october.shop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // 특정 상품의 특정 사이즈 재고 조회
    Optional<Inventory> findByProductAndSize(Product product, String size);

    // 특정 상품의 모든 재고 조회
    List<Inventory> findByProduct(Product product);

    // 재고가 부족한 상품 조회
    List<Inventory> findByAvailableQuantityLessThanEqual(Integer threshold);

    // 특정 상품의 재입고가 필요한 재고 조회
    @Query("SELECT i FROM Inventory i WHERE i.product = :product AND i.availableQuantity <= i.restockPoint")
    List<Inventory> findRestockNeededByProduct(@Param("product") Product product);

    // 전체 재입고가 필요한 재고 조회
    @Query("SELECT i FROM Inventory i WHERE i.availableQuantity <= i.restockPoint")
    List<Inventory> findAllRestockNeeded();

    // 특정 상품의 총 재고량 조회
    @Query("SELECT SUM(i.stockQuantity) FROM Inventory i WHERE i.product = :product")
    Integer getTotalStockByProduct(@Param("product") Product product);

    // 특정 상품의 총 가용 재고량 조회
    @Query("SELECT SUM(i.availableQuantity) FROM Inventory i WHERE i.product = :product")
    Integer getTotalAvailableByProduct(@Param("product") Product product);
}