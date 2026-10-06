package com.ricebowl.api.domain.file;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {
    private final ObjectStorage storage;
    private final ArchiveSecurityScanner archiveScanner;

    public FileService(ObjectStorage storage, ArchiveSecurityScanner archiveScanner) {
        this.storage = storage;
        this.archiveScanner = archiveScanner;
    }

    public String uploadImage(MultipartFile file) {
        String extension = validate(file, 10 * 1024 * 1024L, true);
        return storage.store(file, "images", extension);
    }

    public String uploadArchive(MultipartFile file) {
        String extension = validate(file, 50 * 1024 * 1024L, false);
        archiveScanner.scan(file, extension);
        return storage.store(file, "dotfiles", extension);
    }

    public void deleteByUrl(String url) {
        storage.deleteByUrl(url);
    }

    private String validate(MultipartFile file, long maxBytes, boolean image) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File exceeds the allowed size");
        }

        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
        String contentType = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase();
        boolean accepted = image
                ? contentType.startsWith("image/") && filename.matches(".*\\.(png|jpe?g|webp|gif)$")
                : filename.matches(".*\\.(zip|tar\\.gz)$");
        if (!accepted) {
            throw new IllegalArgumentException(image
                    ? "Only PNG, JPEG, WebP and GIF images are accepted"
                    : "Only ZIP and TAR.GZ archives are accepted");
        }

        String extension = filename.endsWith(".tar.gz")
                ? ".tar.gz"
                : filename.substring(filename.lastIndexOf('.'));
        verifySignature(file, extension, image);
        return extension;
    }

    private void verifySignature(MultipartFile file, String extension, boolean image) {
        byte[] header = new byte[12];
        int read;
        try (InputStream input = file.getInputStream()) {
            read = input.read(header);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not inspect uploaded file", ex);
        }

        boolean valid = image
                ? matchesImageSignature(header, read, extension)
                : matchesArchiveSignature(header, read, extension);
        if (!valid) throw new IllegalArgumentException("File content does not match its extension");
    }

    private boolean matchesArchiveSignature(byte[] header, int read, String extension) {
        return switch (extension) {
            case ".zip" -> startsWith(header, read, 0x50, 0x4b, 0x03, 0x04)
                    || startsWith(header, read, 0x50, 0x4b, 0x05, 0x06);
            case ".tar.gz" -> startsWith(header, read, 0x1f, 0x8b);
            default -> false;
        };
    }

    private boolean matchesImageSignature(byte[] header, int read, String extension) {
        return switch (extension) {
            case ".png" -> startsWith(header, read, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
            case ".jpg", ".jpeg" -> startsWith(header, read, 0xff, 0xd8, 0xff);
            case ".gif" -> startsWith(header, read, 0x47, 0x49, 0x46, 0x38, 0x37, 0x61)
                    || startsWith(header, read, 0x47, 0x49, 0x46, 0x38, 0x39, 0x61);
            case ".webp" -> startsWith(header, read, 0x52, 0x49, 0x46, 0x46)
                    && read >= 12
                    && header[8] == 0x57 && header[9] == 0x45
                    && header[10] == 0x42 && header[11] == 0x50;
            default -> false;
        };
    }

    private boolean startsWith(byte[] actual, int read, int... expected) {
        if (read < expected.length) return false;
        byte[] prefix = Arrays.copyOf(actual, expected.length);
        for (int i = 0; i < expected.length; i++) {
            if ((prefix[i] & 0xff) != expected[i]) return false;
        }
        return true;
    }
}
