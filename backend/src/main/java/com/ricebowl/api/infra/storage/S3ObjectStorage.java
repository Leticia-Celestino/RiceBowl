package com.ricebowl.api.infra.storage;

import com.ricebowl.api.domain.file.ObjectStorage;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
public class S3ObjectStorage implements ObjectStorage {
    private final String bucket;
    private final Duration signedUrlExpiration;
    private final S3Client client;
    private final S3Presigner presigner;

    public S3ObjectStorage(
            @Value("${storage.s3.endpoint}") URI endpoint,
            @Value("${storage.s3.region:auto}") String region,
            @Value("${storage.s3.bucket}") String bucket,
            @Value("${storage.s3.access-key}") String accessKey,
            @Value("${storage.s3.secret-key}") String secretKey,
            @Value("${storage.s3.signed-url-expiration:PT10M}") Duration signedUrlExpiration) {
        this.bucket = bucket;
        this.signedUrlExpiration = signedUrlExpiration;
        var credentials = StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
        var awsRegion = Region.of(region);
        this.client = S3Client.builder()
                .endpointOverride(endpoint)
                .region(awsRegion)
                .credentialsProvider(credentials)
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .build();
        this.presigner = S3Presigner.builder()
                .endpointOverride(endpoint)
                .region(awsRegion)
                .credentialsProvider(credentials)
                .build();
    }

    @Override
    public String store(MultipartFile file, String prefix, String extension) {
        String key = prefix + "/" + UUID.randomUUID() + extension;
        var request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();
        try (var input = file.getInputStream()) {
            client.putObject(request, RequestBody.fromInputStream(input, file.getSize()));
            return reference(key);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read upload for object storage", exception);
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Could not store uploaded file", exception);
        }
    }

    @Override
    public String publicUrl(String reference) {
        var key = keyFrom(reference);
        if (key == null) return reference;
        var getRequestBuilder = GetObjectRequest.builder().bucket(bucket).key(key);
        if (key.startsWith("dotfiles/")) {
            getRequestBuilder.responseContentDisposition("attachment");
        }
        var request = GetObjectPresignRequest.builder()
                .signatureDuration(signedUrlExpiration)
                .getObjectRequest(getRequestBuilder.build())
                .build();
        return presigner.presignGetObject(request).url().toString();
    }

    @Override
    public void delete(String reference) {
        var key = keyFrom(reference);
        if (key == null) return;
        client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }

    private String reference(String key) {
        return "s3://" + bucket + "/" + key;
    }

    private String keyFrom(String reference) {
        if (reference == null || reference.isBlank()) return null;
        String prefix = "s3://" + bucket + "/";
        if (!reference.startsWith(prefix)) return null;
        String key = reference.substring(prefix.length());
        if (key.isBlank() || key.contains("..") || key.startsWith("/")) {
            throw new IllegalArgumentException("Invalid object storage reference");
        }
        return key;
    }

    @PreDestroy
    void close() {
        presigner.close();
        client.close();
    }
}
