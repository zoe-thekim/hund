package com.hund.shop.repository;

import com.hund.shop.model.ProductImages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImages, Long> {
    List<ProductImages> findByProductIdInOrderByProductIdAscSortOrderAsc(List<Long> productIds);
    List<ProductImages> findByProductIdOrderBySortOrderAsc(Long productId);
}
