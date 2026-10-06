package com.ricebowl.api.infra.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SpringDocConfigurations {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList("session-cookie"))
            .components(new Components()
                .addSecuritySchemes("session-cookie",
                    new SecurityScheme()
                        .name("ricebowl_session")
                        .in(SecurityScheme.In.COOKIE)
                        .type(SecurityScheme.Type.APIKEY)));
    }
}
