package com.ricebowl.api.domain.file;

import org.springframework.web.multipart.MultipartFile;

public interface ObjectStorage {
    String store(MultipartFile file, String prefix, String extension);
    void deleteByUrl(String url);
}
