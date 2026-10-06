package com.ricebowl.api.domain.file;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class LocalObjectStorage implements ObjectStorage {
    private final Path root;
    private final String publicBaseUrl;

    public LocalObjectStorage(
            @Value("${storage.local.path:./data/uploads}") String path,
            @Value("${storage.public-base-url:http://localhost:8080}") String publicBaseUrl) {
        this.root = Path.of(path).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
    }

    @Override
    public String store(MultipartFile file, String prefix, String extension) {
        try {
            Path directory = root.resolve(prefix).normalize();
            if (!directory.startsWith(root)) throw new IllegalArgumentException("Invalid storage prefix");
            Files.createDirectories(directory);
            String filename = UUID.randomUUID() + extension;
            Path destination = directory.resolve(filename).normalize();
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return publicBaseUrl + "/uploads/" + prefix + "/" + filename;
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store uploaded file", ex);
        }
    }

    @Override
    public void deleteByUrl(String url) {
        if (url == null || url.isBlank()) return;
        int marker = url.indexOf("/uploads/");
        if (marker < 0) return;
        Path target = root.resolve(url.substring(marker + "/uploads/".length())).normalize();
        if (!target.startsWith(root)) return;
        try {
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not delete stored file", ex);
        }
    }
}
