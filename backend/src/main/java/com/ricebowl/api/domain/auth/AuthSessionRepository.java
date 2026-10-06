package com.ricebowl.api.domain.auth;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {
    @Query("""
            select session from AuthSession session
            join fetch session.user
            where session.tokenHash = :tokenHash
              and session.revokedAt is null
              and session.expiresAt > :now
            """)
    Optional<AuthSession> findActive(@Param("tokenHash") String tokenHash, @Param("now") Instant now);

    @Modifying
    @Query("""
            update AuthSession session set session.revokedAt = :now
            where session.user.id = :userId and session.revokedAt is null
            """)
    int revokeAllForUser(@Param("userId") UUID userId, @Param("now") Instant now);

    void deleteByExpiresAtBefore(Instant cutoff);
}
