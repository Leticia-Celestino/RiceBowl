package com.ricebowl.api.domain.rice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentDTO(
        @NotBlank @Size(max = 4000) String content
) {
    
}
