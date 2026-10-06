package com.ricebowl.api.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterDTO(
    @NotBlank @Size(min = 3, max = 50)
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "must contain only letters, numbers, underscores and hyphens")
    String nickname,
    @NotBlank @Email String email, 
    @NotBlank @Size(min = 8, max = 72) String password
) {
}
