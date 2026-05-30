package com.ricebowl.api.domain.rice.dto;

import com.ricebowl.api.domain.rice.Rice;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

public record RiceDetailDTO(
        UUID id,
        String title,
        String description,
        String distro,
        String windowManager,
        String coverUrl,
        String configUrl,
        String authorNickname,
        Set<String> tags,
        Long karma, 
        List<CommentResponseDTO> comments, 
        LocalDateTime createdAt
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
            rice.getUser().getNickname(),
            rice.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()),
            rice.getKarma() != null ? rice.getKarma() : 0L, 
            rice.getComments() != null ? rice.getComments().stream().map(CommentResponseDTO::new).toList() : List.of(), 
            rice.getCreatedAt()
        );
    }
}