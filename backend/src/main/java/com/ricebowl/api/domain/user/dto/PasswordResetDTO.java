package com.ricebowl.api.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetDTO(
        @NotBlank @Size(max = 128) String token,
        @NotBlank @Size(min = 12, max = 128) String newPassword) {
}
