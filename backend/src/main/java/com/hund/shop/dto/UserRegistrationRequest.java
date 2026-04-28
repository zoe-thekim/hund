package com.hund.shop.dto;

import com.hund.shop.model.Address;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class UserRegistrationRequest {

    @NotBlank(message = "Name is required.")
    @Size(max = 100, message = "Name cannot be longer than 100 characters.")
    private String name;

    @NotBlank(message = "Email is required.")
    @Email(message = "Email format is invalid.")
    @Size(max = 255, message = "Email cannot be longer than 255 characters.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 255, message = "Password must be at least 8 characters.")
    private String password;

    @NotBlank(message = "Phone number is required.")
    @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "Phone number format is invalid.")
    private String phoneNumber;

    private Address address;

    private LocalDate birthDate;

    @AssertTrue(message = "You must accept Terms of Service.")
    private Boolean agreeToTerms;

    @AssertTrue(message = "You must accept the Privacy Policy.")
    private Boolean agreeToPrivacy;

    private Boolean agreeToMarketing = false;
}
