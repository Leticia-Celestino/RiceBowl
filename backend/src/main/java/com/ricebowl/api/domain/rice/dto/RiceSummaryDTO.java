package com.ricebowl.api.domain.rice.dto;

import com.ricebowl.api.domain.rice.Rice;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.function.Function;

public record RiceSummaryDTO(
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
        Long commentCount,
        LocalDateTime createdAt
) {
    public RiceSummaryDTO(Rice rice) {
        this(rice, Function.identity());
    }

    public RiceSummaryDTO(Rice rice, Function<String, String> publicUrl) {
        this(
                rice.getId(),
                rice.getTitle(),
                rice.getDescription(),
                rice.getDistro(),
                rice.getWindowManager(),
                publicUrl.apply(rice.getCoverUrl()),
                publicUrl.apply(rice.getConfigUrl()),
                rice.getUser().getNickname(),
                rice.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet()),
                rice.getKarma() != null ? rice.getKarma() : 0L,
                rice.getCommentCount() != null ? rice.getCommentCount() : 0L,
                rice.getCreatedAt()
        );
    }
}
