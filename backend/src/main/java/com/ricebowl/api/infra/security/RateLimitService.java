package com.ricebowl.api.infra.security;

import com.ricebowl.api.domain.auth.RateLimitEntry;
import com.ricebowl.api.domain.auth.RateLimitEntryRepository;
import com.ricebowl.api.infra.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RateLimitService {
    private final RateLimitEntryRepository repository;

    public RateLimitService(RateLimitEntryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public synchronized void check(String action, String subject, int limit, Duration window) {
        var now = Instant.now();
        var key = TokenHashing.sha256(action + ":" + subject);
        var entry = repository.findForUpdate(key).orElseGet(() -> {
            var created = new RateLimitEntry();
            created.setBucketKey(key);
            created.setWindowStartedAt(now);
            return created;
        });

        var windowEnd = entry.getWindowStartedAt().plus(window);
        if (!now.isBefore(windowEnd)) {
            entry.setWindowStartedAt(now);
            entry.setRequestCount(0);
            windowEnd = now.plus(window);
        }
        if (entry.getRequestCount() >= limit) {
            throw new RateLimitExceededException(Duration.between(now, windowEnd).toSeconds());
        }
        entry.setRequestCount(entry.getRequestCount() + 1);
        repository.save(entry);
    }

    public String clientAddress(HttpServletRequest request) {
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    @Transactional
    public void reset(String action, String subject) {
        repository.deleteById(TokenHashing.sha256(action + ":" + subject));
    }

    @Transactional
    @Scheduled(cron = "${api.security.rate-limit.cleanup-cron:0 45 * * * *}")
    public void cleanup() {
        repository.deleteByWindowStartedAtBefore(Instant.now().minus(Duration.ofDays(2)));
    }
}
