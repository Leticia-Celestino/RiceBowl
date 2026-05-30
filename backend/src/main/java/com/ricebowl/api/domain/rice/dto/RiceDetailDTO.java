package com.ricebowl.api.domain.rice.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ricebowl.api.domain.rice.Rice;

public record RiceDetailDTO(
    UUID id,
    String title,
    String description,
    String distro,
    String windowManager,
    String coverUrl,
    String configUrl,
    LocalDateTime createdAt,
    String authorNickname,
    List<String> tags,
    List<RiceImageDTO> gallery
) {
    public RiceDetailDTO(Rice rice) {
        this(
            rice.getId(),
            rice.getTitle(),
            rice.getDescription(),
            rice.getDistro(),
            rice.getWindowManager(),
            rice.getCoverUrl(),
            rice.getConfigUrl(),
            rice.getCreatedAt(),
            rice.getUser().getNickname(),
            rice.getTags().stream().map(tag -> tag.getName()).toList(),
            rice.getGallery().stream().map(RiceImageDTO::new).toList()
        );
    }
}