package com.ricebowl.api.domain.rice.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record RiceCreateDTO(
    @NotBlank String title,
    String description,
    @NotBlank String distro,
    @NotBlank String windowManager,
    @NotEmpty List<String> tags
) {}