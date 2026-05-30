package com.ricebowl.api.domain.rice.dto;

import com.ricebowl.api.domain.rice.Comment;
import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponseDTO(
        UUID id, 
        String content, 
        String authorNickname, 
        LocalDateTime createdAt
) {
    public CommentResponseDTO(Comment comment) {
        this(
            comment.getId(), 
            comment.getContent(), 
            comment.getAuthor().getNickname(), 
            comment.getCreatedAt()
        );
    }
}