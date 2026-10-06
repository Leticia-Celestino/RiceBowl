package com.ricebowl.api.infra.security;

import com.ricebowl.api.domain.auth.AuthSession;
import com.ricebowl.api.domain.auth.AuthSessionRepository;
import com.ricebowl.api.domain.user.User;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {
    private final AuthSessionRepository repository;
    private final Duration expiration;

    public SessionService(
            AuthSessionRepository repository,
            @Value("${api.security.session.expiration:PT2H}") Duration expiration) {
        this.repository = repository;
        this.expiration = expiration;
    }

    @Transactional
    public String create(User user) {
        var rawToken = TokenHashing.newToken();
        var now = Instant.now();
        var session = new AuthSession();
        session.setUser(user);
        session.setTokenHash(TokenHashing.sha256(rawToken));
        session.setCreatedAt(now);
        session.setExpiresAt(now.plus(expiration));
        repository.save(session);
        return rawToken;
    }

    @Transactional(readOnly = true)
    public Optional<User> authenticate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return Optional.empty();
        return repository.findActive(TokenHashing.sha256(rawToken), Instant.now())
                .map(AuthSession::getUser);
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return;
        repository.findActive(TokenHashing.sha256(rawToken), Instant.now())
                .ifPresent(session -> session.setRevokedAt(Instant.now()));
    }

    @Transactional
    public void revokeAll(User user) {
        repository.revokeAllForUser(user.getId(), Instant.now());
    }

    @Transactional
    @Scheduled(cron = "${api.security.session.cleanup-cron:0 15 * * * *}")
    public void cleanupExpiredSessions() {
        repository.deleteByExpiresAtBefore(Instant.now().minus(Duration.ofDays(1)));
    }
}
