package com.ricebowl.api.domain.file;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class FileService {

    private final S3Client s3Client;
    private final String bucketName;
    private final String endpoint;

    // Injeção de dependências via construtor
    public FileService(S3Client s3Client,
                        @Value("${minio.bucket-name}") String bucketName,
                        @Value("${minio.endpoint}") String endpoint) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.endpoint = endpoint;
    }

    public String upload(MultipartFile file) {
        try {
            // 1. Extrai a extensão original (ex: .png, .tar.gz)
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            
            // 2. Cria um nome único usando UUID
            String newFilename = UUID.randomUUID() + extension;

            // 3. Prepara a requisição para o S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(newFilename)
                    .contentType(file.getContentType())
                    .build();

            // 4. Envia o ficheiro usando os bytes do fluxo de entrada
            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 5. Devolve a URL pública completa para guardarmos no Postgres
            return endpoint + "/" + bucketName + "/" + newFilename;
            
        } catch (IOException e) {
            throw new RuntimeException("Falha ao ler o ficheiro de upload", e);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao comunicar com o servidor de storage", e);
        }
    }
}