package com.ricebowl.api.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthenticationDTO(
        @NotBlank @Email @jakarta.validation.constraints.Size(max = 100) String email,
        @NotBlank String password
) {
}
