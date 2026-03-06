package com.october.shop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "detail_address", length = 500)
    private String detailAddress;
}