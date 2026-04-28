package com.hund.shop.dto;

import com.hund.shop.model.Address;
import com.hund.shop.model.User;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDate birthDate;
    private String profileImageUrl;
    private Boolean phoneVerified;
    private User.AuthProvider provider;
    private Address address;
    private Boolean agreeToMarketing;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private User.UserRole role;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setBirthDate(user.getBirthDate());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setPhoneVerified(user.getPhoneVerified());
        response.setProvider(user.getProvider());
        response.setAddress(user.getAddress());
        response.setAgreeToMarketing(user.getAgreeToMarketing());
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLoginAt(user.getLastLoginAt());
        response.setRole(user.getRole());
        return response;
    }
}
