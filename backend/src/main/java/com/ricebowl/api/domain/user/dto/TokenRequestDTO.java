package com.ricebowl.api.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TokenRequestDTO(@NotBlank @Size(max = 128) String token) {
}
