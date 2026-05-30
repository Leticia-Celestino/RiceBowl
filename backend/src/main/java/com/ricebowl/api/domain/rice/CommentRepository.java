package com.ricebowl.api.domain.rice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findAllByRiceIdOrderByCreatedAtAsc(UUID riceId, Pageable pageable);
}