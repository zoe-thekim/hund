package com.hund.shop.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class UserLoginRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Email format is invalid.")
    private String email;

    @NotBlank(message = "Password is required.")
    private String password;
}
