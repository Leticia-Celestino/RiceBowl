package com.ricebowl.api.domain.file;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {
    private final ObjectStorage storage;

    public FileService(ObjectStorage storage) {
        this.storage = storage;
    }

    public String uploadImage(MultipartFile file) {
        String extension = validate(file, 10 * 1024 * 1024L, true);
        return storage.store(file, "images", extension);
    }

    public String uploadArchive(MultipartFile file) {
        String extension = validate(file, 50 * 1024 * 1024L, false);
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
                : filename.matches(".*\\.(zip|tar\\.gz|tar\\.xz)$");
        if (!accepted) {
            throw new IllegalArgumentException(image
                    ? "Only PNG, JPEG, WebP and GIF images are accepted"
                    : "Only ZIP, TAR.GZ and TAR.XZ archives are accepted");
        }

        if (filename.endsWith(".tar.gz")) return ".tar.gz";
        if (filename.endsWith(".tar.xz")) return ".tar.xz";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
