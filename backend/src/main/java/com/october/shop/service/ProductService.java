package com.october.shop.service;

import com.october.shop.dto.ProductImageResponse;
import com.october.shop.dto.ProductResponse;
import com.october.shop.model.Product;
import com.october.shop.model.ProductImages;
import com.october.shop.repository.ProductImageRepository;
import com.october.shop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductImageRepository productImageRepository;

    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return mapProductsWithImages(products);
    }

    public Optional<ProductResponse> getProductById(Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    List<ProductImages> images = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId());
                    return toResponse(product, images);
                });
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        List<Product> products = productRepository.findByCategory(category);
        return mapProductsWithImages(products);
    }

    public List<ProductResponse> searchProducts(String keyword) {
        List<Product> products = productRepository.findByNameContaining(keyword);
        return mapProductsWithImages(products);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private List<ProductResponse> mapProductsWithImages(List<Product> products) {
        List<Long> productIds = products.stream().map(Product::getId).toList();
        List<ProductImages> images = productIds.isEmpty()
                ? List.of()
                : productImageRepository.findByProductIdInOrderByProductIdAscSortOrderAsc(productIds);

        Map<Long, List<ProductImages>> imagesByProductId = new HashMap<>();
        for (ProductImages image : images) {
            Long productId = image.getProduct().getId();
            imagesByProductId.computeIfAbsent(productId, key -> new ArrayList<>()).add(image);
        }

        return products.stream()
                .map(product -> toResponse(product, imagesByProductId.getOrDefault(product.getId(), List.of())))
                .collect(Collectors.toList());
    }

    private ProductResponse toResponse(Product product, List<ProductImages> productImages) {
        List<ProductImages> sortedImages = productImages == null
                ? List.of()
                : productImages.stream()
                        .sorted(Comparator.comparing(
                                img -> Optional.ofNullable(img.getSortOrder()).orElse(Integer.MAX_VALUE)
                        ))
                        .collect(Collectors.toList());

        List<ProductImageResponse> images = sortedImages.isEmpty()
                ? List.of()
                : sortedImages.stream()
                        .map(img -> new ProductImageResponse(
                                img.getId(),
                                img.getImageUrl(),
                                img.getAltText(),
                                img.getSortOrder(),
                                img.getIsPrimary()
                        ))
                        .collect(Collectors.toList());

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getCategory(),
                product.getDescription(),
                product.getSizes(),
                product.getColor(),
                product.getIsActive(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                images
        );
    }
}
