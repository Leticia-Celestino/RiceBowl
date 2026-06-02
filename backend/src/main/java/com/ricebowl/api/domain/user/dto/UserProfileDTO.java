package com.ricebowl.api.domain.user.dto;

import java.util.UUID;

public record UserProfileDTO(
        UUID id,
        String nickname,
        String avatarUrl,
        String bio, 
        Long totalKarma,
        Long riceCount
) {}