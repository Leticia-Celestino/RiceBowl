package com.ricebowl.api.domain.file;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

class FileServiceTest {
    private RecordingStorage storage;
    private FileService service;

    @BeforeEach
    void setUp() {
        storage = new RecordingStorage();
        service = new FileService(storage, new ArchiveSecurityScanner());
    }

    @Test
    void acceptsImageWhenExtensionAndSignatureMatch() {
        byte[] png = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00};
        var file = new MockMultipartFile("file", "cover.png", "image/png", png);

        assertEquals("stored://images.png", service.uploadImage(file));
        assertEquals(1, storage.calls);
    }

    @Test
    void rejectsImageWithForgedExtension() {
        var file = new MockMultipartFile(
                "file", "cover.png", "image/png", "not an image".getBytes(StandardCharsets.UTF_8));

        assertThrows(IllegalArgumentException.class, () -> service.uploadImage(file));
        assertEquals(0, storage.calls);
    }

    @Test
    void acceptsSafeZip() throws IOException {
        var file = zip("config/hypr.conf", "monitor=preferred");

        assertEquals("stored://dotfiles.zip", service.uploadArchive(file));
        assertEquals(1, storage.calls);
    }

    @Test
    void rejectsArchivePathTraversal() throws IOException {
        var file = zip("../../authorized_keys", "blocked");

        assertThrows(IllegalArgumentException.class, () -> service.uploadArchive(file));
        assertEquals(0, storage.calls);
    }

    @Test
    void rejectsHighConfidenceSecret() throws IOException {
        var file = zip("private.pem", "-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----");

        assertThrows(IllegalArgumentException.class, () -> service.uploadArchive(file));
        assertEquals(0, storage.calls);
    }

    private MockMultipartFile zip(String name, String content) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(output)) {
            zip.putNextEntry(new ZipEntry(name));
            zip.write(content.getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
        }
        return new MockMultipartFile("file", "dotfiles.zip", "application/zip", output.toByteArray());
    }

    private static final class RecordingStorage implements ObjectStorage {
        private int calls;

        @Override
        public String store(MultipartFile file, String prefix, String extension) {
            calls++;
            return "stored://" + prefix + extension;
        }

        @Override
        public void deleteByUrl(String url) {
        }
    }
}
