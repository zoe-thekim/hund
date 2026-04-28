package com.hund.shop.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileImageService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".png", ".jpg", ".jpeg", ".webp", ".gif");

    @Value("${app.upload-dir:uploads/avatars}")
    private String uploadDir;

    public String storeProfileImage(MultipartFile file, Long userId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No image file was provided.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image size must be 5MB or less.");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported image format.");
        }

        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String extension = resolveExtension(contentType, originalName);
        if (extension.isEmpty()) {
            throw new IllegalArgumentException("Unable to determine image extension.");
        }

        Path baseDir = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(baseDir);

        String fileName = createFileName(userId, extension);
        Path targetPath = baseDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/avatars/" + fileName;
    }

    public void deleteProfileImage(String profileImageUrl) {
        if (profileImageUrl == null || !profileImageUrl.startsWith("/uploads/avatars/")) {
            return;
        }

        Path baseDir = Path.of(uploadDir).toAbsolutePath().normalize();
        Path filePath = baseDir.resolve(profileImageUrl.substring("/uploads/avatars/".length()));
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Image delete failures are non-critical.
        }
    }

    private String resolveExtension(String contentType, String originalName) {
        String extension = "";
        switch (contentType) {
            case "image/png":
                extension = ".png";
                break;
            case "image/jpeg":
            case "image/jpg":
                extension = ".jpg";
                break;
            case "image/webp":
                extension = ".webp";
                break;
            case "image/gif":
                extension = ".gif";
                break;
            default:
                break;
        }

        if (extension.isBlank() && !originalName.isBlank()) {
            int lastDot = originalName.lastIndexOf('.');
            if (lastDot >= 0 && lastDot < originalName.length() - 1) {
                String rawExt = originalName.substring(lastDot).toLowerCase();
                if (ALLOWED_EXTENSIONS.contains(rawExt)) {
                    extension = rawExt.equals(".jpeg") ? ".jpg" : rawExt;
                }
            }
        }

        if (extension.equals(".jpeg")) {
            extension = ".jpg";
        }

        return extension;
    }

    private String createFileName(Long userId, String extension) {
        String sanitizedId = userId == null ? "guest" : String.valueOf(userId);
        String timestamp = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss").format(LocalDateTime.now());
        return String.format("profile_%s_%s_%s%s", sanitizedId, timestamp, UUID.randomUUID(), extension);
    }
}
