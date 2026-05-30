package com.ricebowl.api.domain.rice.dto;

import com.ricebowl.api.domain.rice.RiceImage;
import java.util.UUID;

public record RiceImageDTO(
        UUID id,
        String url,
        String description
) {
    public RiceImageDTO(RiceImage image) {
        this(image.getId(), image.getUrl(), image.getDescription());
    }
}