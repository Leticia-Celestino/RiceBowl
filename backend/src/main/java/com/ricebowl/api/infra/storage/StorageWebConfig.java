package com.ricebowl.api.infra.storage;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StorageWebConfig implements WebMvcConfigurer {
    private final String resourceLocation;

    public StorageWebConfig(@Value("${storage.local.path:./data/uploads}") String path) {
        String uri = Path.of(path).toAbsolutePath().normalize().toUri().toString();
        this.resourceLocation = uri.endsWith("/") ? uri : uri + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**").addResourceLocations(resourceLocation);
    }
}
