package com.ricebowl.api.domain.auth;

import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface RateLimitEntryRepository extends JpaRepository<RateLimitEntry, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select entry from RateLimitEntry entry where entry.bucketKey = :key")
    Optional<RateLimitEntry> findForUpdate(@Param("key") String key);

    void deleteByWindowStartedAtBefore(Instant cutoff);
}
