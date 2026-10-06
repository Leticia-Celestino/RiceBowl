package com.ricebowl.api.domain.auth;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountTokenRepository extends JpaRepository<AccountToken, UUID> {
    @Query("""
            select token from AccountToken token
            join fetch token.user
            where token.tokenHash = :tokenHash
              and token.tokenType = :type
              and token.usedAt is null
              and token.expiresAt > :now
            """)
    Optional<AccountToken> findUsable(
            @Param("tokenHash") String tokenHash,
            @Param("type") AccountTokenType type,
            @Param("now") Instant now);

    @Modifying
    @Query("""
            update AccountToken token set token.usedAt = :now
            where token.user.id = :userId and token.tokenType = :type and token.usedAt is null
            """)
    int invalidateForUser(
            @Param("userId") UUID userId,
            @Param("type") AccountTokenType type,
            @Param("now") Instant now);

    void deleteByExpiresAtBefore(Instant cutoff);
}
