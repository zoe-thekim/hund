package com.october.shop.controller;

import com.october.shop.dto.UserResponse;
import com.october.shop.model.User;
import com.october.shop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        // TODO: JWT 토큰으로 사용자 인증 및 권한 확인
        Optional<User> userOpt = userService.findByEmail("dummy@email.com"); // 임시

        if (userOpt.isPresent()) {
            UserResponse response = UserResponse.from(userOpt.get());
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            // TODO: JWT 토큰으로 사용자 인증 및 권한 확인
            Optional<User> userOpt = userService.findByEmail("dummy@email.com"); // 임시

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // 업데이트 가능한 필드들만 수정
                if (updates.containsKey("name")) {
                    user.setName((String) updates.get("name"));
                }
                if (updates.containsKey("agreeToMarketing")) {
                    user.setAgreeToMarketing((Boolean) updates.get("agreeToMarketing"));
                }
                // 주소 정보 업데이트
                if (updates.containsKey("address")) {
                    Map<String, String> addressMap = (Map<String, String>) updates.get("address");
                    if (user.getAddress() != null) {
                        if (addressMap.containsKey("detailAddress")) {
                            user.getAddress().setDetailAddress(addressMap.get("detailAddress"));
                        }
                    }
                }

                User updatedUser = userService.updateUser(user);
                UserResponse response = UserResponse.from(updatedUser);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "프로필 업데이트에 실패했습니다.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        // TODO: 비밀번호 변경 로직 구현
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        Map<String, String> response = new HashMap<>();
        response.put("message", "비밀번호가 변경되었습니다.");
        return ResponseEntity.ok(response);
    }
}
