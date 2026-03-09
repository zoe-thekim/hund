package com.october.shop.service;

import com.october.shop.model.User;
import com.october.shop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }

        // 휴대폰 번호 중복 체크 (값이 있는 경우에만)
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().trim().isEmpty()
            && userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new RuntimeException("이미 등록된 휴대폰 번호입니다.");
        }

        // 휴대폰 번호 필수 체크
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("휴대폰 번호는 필수입니다.");
        }

        // 비밀번호 암호화
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    public Optional<User> findByProviderAndProviderId(User.AuthProvider provider, String providerId) {
        return userRepository.findByProviderAndProviderId(provider, providerId);
    }

    public User authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                user.setLastLoginAt(LocalDateTime.now());
                return userRepository.save(user);
            }
        }
        throw new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    public User updateUser(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void verifyPhoneNumber(String phoneNumber) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPhoneVerified(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean isPhoneNumberExists(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    public User createOrUpdateOAuthUser(User.AuthProvider provider, String providerId,
                                      String email, String name) {
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(provider, providerId);

        if (existingUser.isPresent()) {
            // 기존 사용자 업데이트
            User user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            // 새 사용자 생성
            User newUser = new User();
            newUser.setProvider(provider);
            newUser.setProviderId(providerId);
            newUser.setEmail(email);
            newUser.setName(name);
            // OAuth 가입 시 전화번호를 아직 받지 못한 경우를 대비한 기본값
            newUser.setPhoneNumber("UNREGISTERED");
            newUser.setPhoneVerified(false);
            newUser.setEnabled(true);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setLastLoginAt(LocalDateTime.now());

            return userRepository.save(newUser);
        }
    }
}
