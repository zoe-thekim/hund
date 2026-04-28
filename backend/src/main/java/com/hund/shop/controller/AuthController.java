package com.hund.shop.controller;

import com.hund.shop.dto.*;
import com.hund.shop.model.User;
import com.hund.shop.security.JwtTokenProvider;
import com.hund.shop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setAddress(request.getAddress());
            user.setBirthDate(request.getBirthDate());
            user.setAgreeToTerms(request.getAgreeToTerms());
            user.setAgreeToPrivacy(request.getAgreeToPrivacy());
            user.setAgreeToMarketing(request.getAgreeToMarketing());

            User savedUser = userService.registerUser(user);
            UserResponse response = UserResponse.from(savedUser);
            response.setProfileImageUrl(toAbsoluteProfileImageUrl(response.getProfileImageUrl()));

            Map<String, Object> registerResponse = new HashMap<>();
            registerResponse.put("user", response);
            registerResponse.put("token", jwtTokenProvider.generateToken(savedUser));

            return ResponseEntity.ok(registerResponse);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest request) {
        try {
            User user = userService.authenticateUser(request.getEmail(), request.getPassword());
            UserResponse response = UserResponse.from(user);
            response.setProfileImageUrl(toAbsoluteProfileImageUrl(response.getProfileImageUrl()));

            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("user", response);
            loginResponse.put("token", jwtTokenProvider.generateToken(user));

            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.isEmailExists(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhone(@RequestParam String phoneNumber) {
        boolean exists = userService.isPhoneNumberExists(phoneNumber);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);

        if (exists) {
            // Return matching user info (with sensitive data omitted)
            Optional<User> userOpt = userService.findByPhoneNumber(phoneNumber);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("name", user.getName());
                userInfo.put("email", user.getEmail().substring(0, 3) + "***" + user.getEmail().substring(user.getEmail().indexOf("@")));
                userInfo.put("registrationDate", user.getCreatedAt().toLocalDate());
                response.put("userInfo", userInfo);
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<?> verifyPhone(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String verificationCode = request.get("verificationCode");

        // TODO: Replace with real verification-code validation service.
        if ("123456".equals(verificationCode)) { // Temporary verification code
            userService.verifyPhoneNumber(phoneNumber);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Phone verification completed.");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "The verification code is invalid.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");

        // TODO: Integrate SMS provider
        System.out.println("Verification code sent: " + phoneNumber + " -> 123456");

        Map<String, String> response = new HashMap<>();
        response.put("message", "Verification code sent.");
        return ResponseEntity.ok(response);
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
}
