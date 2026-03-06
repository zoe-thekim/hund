package com.october.shop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "product_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @Column(length = 1000, nullable = false)
    private String imageUrl;

    @Column(length = 300)
    private String altText;

    @Column(name = "sort_order")
    private Integer sortOrder; // 0,1,2... (갤러리 순서)

    @Column(name = "is_primary")
    private Boolean isPrimary = false; // 대표 이미지 여부
}
