package com.ricebowl.api.domain.auth;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rate_limit_entries")
@Getter
@Setter
@NoArgsConstructor
public class RateLimitEntry {
    @Id
    private String bucketKey;
    private int requestCount;
    private Instant windowStartedAt;
}
