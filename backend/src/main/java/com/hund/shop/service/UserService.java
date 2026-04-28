package com.hund.shop.service;

import com.hund.shop.model.User;
import com.hund.shop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProfileImageService profileImageService;

    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[abyx]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    public User registerUser(User user) {
        String normalizedEmail = normalizeEmail(user.getEmail());
        if (normalizedEmail == null) {
            throw new RuntimeException("Email is required.");
        }

        user.setEmail(normalizedEmail);

        // 이메일 중복 체크
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already registered.");
        }

        // 휴대폰 번호 중복 체크 (값이 있는 경우에만)
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().trim().isEmpty()
            && userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new RuntimeException("Phone number is already registered.");
        }

        // 휴대폰 번호 필수 체크
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required.");
        }

        // 비밀번호 암호화
        if (user.getPassword() != null && !BCRYPT_PATTERN.matcher(user.getPassword()).matches()) {
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
        String normalizedEmail = normalizeEmail(email);
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPassword();

            if (storedPassword == null || password == null) {
                throw new RuntimeException("Email or password is incorrect.");
            }

            boolean isMatch = passwordEncoder.matches(password, storedPassword);
            if (!isMatch && isLegacyPassword(storedPassword, password)) {
                user.setPassword(passwordEncoder.encode(password));
                isMatch = true;
            }

            if (isMatch) {
                user.setLastLoginAt(LocalDateTime.now());
                user = userRepository.save(user);
                return user;
            }
        }
        throw new RuntimeException("Email or password is incorrect.");
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

    public boolean changePassword(String email, String currentPassword, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        String storedPassword = user.getPassword();

        if (storedPassword == null || currentPassword == null || newPassword == null) {
            return false;
        }

        boolean isCurrentPasswordCorrect = passwordEncoder.matches(currentPassword, storedPassword);
        if (!isCurrentPasswordCorrect && isLegacyPassword(storedPassword, currentPassword)) {
            isCurrentPasswordCorrect = true;
        }

        if (!isCurrentPasswordCorrect) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }

    public boolean isPhoneNumberExists(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    public User updateProfileImage(String email, MultipartFile file) {
        String normalizedEmail = normalizeEmail(email);
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }

        User user = userOpt.get();
        String oldImageUrl = user.getProfileImageUrl();
        String newImageUrl;
        try {
            newImageUrl = profileImageService.storeProfileImage(file, user.getId());
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to save image.");
        }

        user.setProfileImageUrl(newImageUrl);
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        profileImageService.deleteProfileImage(oldImageUrl);
        return saved;
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

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }

        String trimmed = email.trim();
        return trimmed.isBlank() ? null : trimmed.toLowerCase();
    }

    private boolean isLegacyPassword(String storedPassword, String plainPassword) {
        return !BCRYPT_PATTERN.matcher(storedPassword).matches() && storedPassword.equals(plainPassword);
    }
}
