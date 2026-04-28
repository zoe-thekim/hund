package com.hund.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private Integer price;
    private String category;
    private String description;
    private List<String> sizes;
    private String color;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ProductImageResponse> images;
}
