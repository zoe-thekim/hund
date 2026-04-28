package com.hund.shop.controller;

import com.hund.shop.dto.UserResponse;
import com.hund.shop.model.User;
import com.hund.shop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userService.findByEmail(email);

            if (userOpt.isPresent()) {
                UserResponse response = UserResponse.from(userOpt.get());
                response.setProfileImageUrl(toAbsoluteProfileImageUrl(response.getProfileImageUrl()));
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unable to verify authentication.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody Map<String, Object> updates) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userService.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // 업데이트 가능한 필드들만 수정
                if (updates.containsKey("name")) {
                    user.setName((String) updates.get("name"));
                }
                if (updates.containsKey("phoneNumber")) {
                    user.setPhoneNumber((String) updates.get("phoneNumber"));
                }
                if (updates.containsKey("agreeToMarketing")) {
                    user.setAgreeToMarketing((Boolean) updates.get("agreeToMarketing"));
                }
                if (updates.containsKey("profileImageUrl")) {
                    Object profileImageUrl = updates.get("profileImageUrl");
                    user.setProfileImageUrl(profileImageUrl == null ? null : profileImageUrl.toString());
                }
                // 주소 정보 업데이트
                if (updates.containsKey("address")) {
                    Map<String, String> addressMap = (Map<String, String>) updates.get("address");
                    if (user.getAddress() != null) {
                        if (addressMap.containsKey("postalCode")) {
                            user.getAddress().setPostalCode(addressMap.get("postalCode"));
                        }
                        if (addressMap.containsKey("address")) {
                            user.getAddress().setAddress(addressMap.get("address"));
                        }
                        if (addressMap.containsKey("detailAddress")) {
                            user.getAddress().setDetailAddress(addressMap.get("detailAddress"));
                        }
                    }
                }
                if (updates.containsKey("birthDate") || updates.containsKey("birthday")) {
                    Object birthDateValue = updates.containsKey("birthDate") ? updates.get("birthDate") : updates.get("birthday");
                    user.setBirthDate(parseBirthDate(birthDateValue));
                }

                User updatedUser = userService.updateUser(user);
                UserResponse response = UserResponse.from(updatedUser);
                response.setProfileImageUrl(toAbsoluteProfileImageUrl(response.getProfileImageUrl()));
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Current and new password are required.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            boolean success = userService.changePassword(email, currentPassword, newPassword);

            if (success) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password changed successfully.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Current password is incorrect.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Password change failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile image) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User updatedUser = userService.updateProfileImage(email, image);
            String profileImageUrl = updatedUser.getProfileImageUrl();

            if (profileImageUrl == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Image upload failed.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

            String publicUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path(profileImageUrl)
                .build()
                .toUriString();

            Map<String, Object> response = new HashMap<>();
            response.put("profileImageUrl", publicUrl);
            response.put("user", UserResponse.from(updatedUser));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Image upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private String toAbsoluteProfileImageUrl(String profileImageUrl) {
        if (profileImageUrl == null || profileImageUrl.isBlank()) {
            return profileImageUrl;
        }

        if (profileImageUrl.startsWith("http://") || profileImageUrl.startsWith("https://")) {
            return profileImageUrl;
        }

        if (profileImageUrl.startsWith("/uploads/")) {
            return ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path(profileImageUrl)
                .build()
                .toUriString();
        }

        return profileImageUrl;
    }

    private LocalDate parseBirthDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate) {
            return (LocalDate) value;
        }
        if (value instanceof Date) {
            return ((Date) value).toLocalDate();
        }
        if (value instanceof String) {
            String raw = ((String) value).trim();
            if (raw.isEmpty()) {
                return null;
            }
            try {
                return LocalDate.parse(raw);
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("Invalid birthDate format. Use yyyy-MM-dd.");
            }
        }

        throw new IllegalArgumentException("Unsupported birthDate format.");
    }
}
