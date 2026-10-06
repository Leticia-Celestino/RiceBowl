package com.ricebowl.api.domain.file;

import org.springframework.web.multipart.MultipartFile;

public interface ObjectStorage {
    String store(MultipartFile file, String prefix, String extension);
    String publicUrl(String reference);
    void delete(String reference);
}
