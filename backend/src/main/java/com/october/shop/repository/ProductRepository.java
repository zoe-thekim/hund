package com.october.shop.repository;

import com.october.shop.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Override
    @EntityGraph(attributePaths = "images")
    List<Product> findAll();

    @Override
    @EntityGraph(attributePaths = "images")
    Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = "images")
    List<Product> findByCategory(String category);

    @EntityGraph(attributePaths = "images")
    List<Product> findByNameContaining(String name);
}
