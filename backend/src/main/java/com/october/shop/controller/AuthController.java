package com.october.shop.controller;

import com.october.shop.dto.*;
import com.october.shop.model.User;
import com.october.shop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setNickname(request.getNickname());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setAddress(request.getAddress());
            user.setAgreeToTerms(request.getAgreeToTerms());
            user.setAgreeToPrivacy(request.getAgreeToPrivacy());
            user.setAgreeToMarketing(request.getAgreeToMarketing());

            User savedUser = userService.registerUser(user);
            UserResponse response = UserResponse.from(savedUser);

            return ResponseEntity.ok(response);
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

            // TODO: JWT 토큰 생성 및 반환
            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("user", response);
            loginResponse.put("token", "dummy-jwt-token"); // 임시 토큰

            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.isEmailExists(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNickname(@RequestParam String nickname) {
        boolean exists = userService.isNicknameExists(nickname);
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
            // 기존 회원 정보 반환 (민감한 정보 제외)
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

        // TODO: 실제 인증 코드 확인 로직
        if ("123456".equals(verificationCode)) { // 임시 인증 코드
            userService.verifyPhoneNumber(phoneNumber);
            Map<String, String> response = new HashMap<>();
            response.put("message", "휴대폰 인증이 완료되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "인증 코드가 올바르지 않습니다.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");

        // TODO: 실제 SMS 발송 로직
        System.out.println("인증 코드 발송: " + phoneNumber + " -> 123456");

        Map<String, String> response = new HashMap<>();
        response.put("message", "인증 코드가 발송되었습니다.");
        return ResponseEntity.ok(response);
    }
}