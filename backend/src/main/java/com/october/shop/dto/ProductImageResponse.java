package com.october.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private String altText;
    private Integer sortOrder;
    private Boolean isPrimary;
}
