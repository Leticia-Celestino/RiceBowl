package com.ricebowl.api.domain.user.dto;
import java.util.UUID;

public record UserResponseDTO(UUID id, String nickname, String email, String bio) {
}