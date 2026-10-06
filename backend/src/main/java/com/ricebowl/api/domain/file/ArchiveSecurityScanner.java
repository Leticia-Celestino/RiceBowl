package com.ricebowl.api.domain.file;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;
import org.apache.commons.compress.archivers.ArchiveEntry;
import org.apache.commons.compress.archivers.ArchiveInputStream;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;
import org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ArchiveSecurityScanner {
    private static final int MAX_ENTRIES = 5_000;
    private static final long MAX_ENTRY_BYTES = 20L * 1024 * 1024;
    private static final long MAX_TOTAL_BYTES = 200L * 1024 * 1024;
    private static final int MAX_SECRET_SCAN_BYTES = 2 * 1024 * 1024;

    private static final Pattern PRIVATE_KEY = Pattern.compile(
            "-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----");
    private static final Pattern AWS_ACCESS_KEY = Pattern.compile("AKIA[0-9A-Z]{16}");
    private static final Pattern GITHUB_TOKEN = Pattern.compile("gh[pousr]_[A-Za-z0-9]{30,}");
    private static final Pattern SLACK_TOKEN = Pattern.compile("xox[baprs]-[A-Za-z0-9-]{20,}");

    public void scan(MultipartFile file, String extension) {
        try (InputStream raw = new BufferedInputStream(file.getInputStream());
             ArchiveInputStream<?> archive = open(raw, extension)) {
            scanEntries(archive);
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (IOException ex) {
            throw new IllegalArgumentException("Archive is invalid or corrupted", ex);
        }
    }

    private ArchiveInputStream<?> open(InputStream input, String extension) throws IOException {
        return switch (extension) {
            case ".zip" -> new ZipArchiveInputStream(input);
            case ".tar.gz" -> new TarArchiveInputStream(new GzipCompressorInputStream(input));
            default -> throw new IllegalArgumentException("Unsupported archive format");
        };
    }

    private void scanEntries(ArchiveInputStream<?> archive) throws IOException {
        int entries = 0;
        long totalBytes = 0;
        ArchiveEntry entry;

        while ((entry = archive.getNextEntry()) != null) {
            entries++;
            if (entries > MAX_ENTRIES) {
                throw new IllegalArgumentException("Archive contains too many entries");
            }
            validateEntry(entry, archive);
            if (entry.isDirectory()) continue;
            if (entry.getSize() > MAX_ENTRY_BYTES) {
                throw new IllegalArgumentException("Archive contains an oversized file");
            }

            ByteArrayOutputStream sample = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            long entryBytes = 0;
            int read;
            while ((read = archive.read(buffer)) != -1) {
                entryBytes += read;
                totalBytes += read;
                if (entryBytes > MAX_ENTRY_BYTES || totalBytes > MAX_TOTAL_BYTES) {
                    throw new IllegalArgumentException("Archive expands beyond the allowed limit");
                }
                int remaining = MAX_SECRET_SCAN_BYTES - sample.size();
                if (remaining > 0) sample.write(buffer, 0, Math.min(read, remaining));
            }
            detectSecrets(entry.getName(), sample.toByteArray());
        }

        if (entries == 0) throw new IllegalArgumentException("Archive must not be empty");
    }

    private void validateEntry(ArchiveEntry entry, ArchiveInputStream<?> archive) {
        String normalized = entry.getName().replace('\\', '/');
        if (normalized.isBlank() || normalized.startsWith("/") || normalized.indexOf('\0') >= 0) {
            throw new IllegalArgumentException("Archive contains an invalid path");
        }
        for (String segment : normalized.split("/")) {
            if (segment.equals("..")) {
                throw new IllegalArgumentException("Archive contains path traversal");
            }
        }
        if (!archive.canReadEntryData(entry)) {
            throw new IllegalArgumentException("Archive contains an unsupported entry");
        }
        if (entry instanceof TarArchiveEntry tar && (tar.isSymbolicLink() || tar.isLink())) {
            throw new IllegalArgumentException("Archive links are not allowed");
        }
        if (entry instanceof ZipArchiveEntry zip && zip.isUnixSymlink()) {
            throw new IllegalArgumentException("Archive links are not allowed");
        }
    }

    private void detectSecrets(String filename, byte[] sample) {
        if (sample.length == 0 || looksBinary(sample)) return;
        String text = new String(sample, StandardCharsets.UTF_8);
        if (PRIVATE_KEY.matcher(text).find()
                || AWS_ACCESS_KEY.matcher(text).find()
                || GITHUB_TOKEN.matcher(text).find()
                || SLACK_TOKEN.matcher(text).find()) {
            throw new IllegalArgumentException("Potential secret detected in " + safeName(filename));
        }
    }

    private boolean looksBinary(byte[] bytes) {
        int control = 0;
        int checked = Math.min(bytes.length, 4096);
        for (int i = 0; i < checked; i++) {
            int value = bytes[i] & 0xff;
            if (value == 0) return true;
            if (value < 9 || (value > 13 && value < 32)) control++;
        }
        return checked > 0 && control > checked / 10;
    }

    private String safeName(String filename) {
        String normalized = filename.replace('\\', '/');
        int slash = normalized.lastIndexOf('/');
        String base = slash >= 0 ? normalized.substring(slash + 1) : normalized;
        return base.toLowerCase(Locale.ROOT);
    }
}
