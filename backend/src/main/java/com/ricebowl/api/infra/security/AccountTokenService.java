package com.ricebowl.api.infra.security;

import com.ricebowl.api.domain.auth.AccountToken;
import com.ricebowl.api.domain.auth.AccountTokenRepository;
import com.ricebowl.api.domain.auth.AccountTokenType;
import com.ricebowl.api.domain.user.User;
import com.ricebowl.api.domain.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AccountTokenService {
    private static final Logger log = LoggerFactory.getLogger(AccountTokenService.class);
    private final AccountTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final AccountMailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final Duration verificationExpiration;
    private final Duration resetExpiration;

    public AccountTokenService(
            AccountTokenRepository tokenRepository,
            UserRepository userRepository,
            AccountMailService mailService,
            PasswordEncoder passwordEncoder,
            SessionService sessionService,
            @Value("${api.security.email-verification.expiration:PT24H}") Duration verificationExpiration,
            @Value("${api.security.password-reset.expiration:PT30M}") Duration resetExpiration) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.verificationExpiration = verificationExpiration;
        this.resetExpiration = resetExpiration;
    }

    @Transactional
    public void sendVerification(User user) {
        var rawToken = issue(user, AccountTokenType.EMAIL_VERIFICATION, verificationExpiration);
        try {
            mailService.sendVerification(user, rawToken);
        } catch (RuntimeException exception) {
            log.error("Could not deliver account verification email: {}", exception.getClass().getSimpleName());
        }
    }

    @Transactional
    public void verifyEmail(String rawToken) {
        var token = consume(rawToken, AccountTokenType.EMAIL_VERIFICATION);
        token.getUser().setEmailVerified(true);
    }

    @Transactional
    public void requestPasswordReset(User user) {
        var rawToken = issue(user, AccountTokenType.PASSWORD_RESET, resetExpiration);
        try {
            mailService.sendPasswordReset(user, rawToken);
        } catch (RuntimeException exception) {
            log.error("Could not deliver password reset email: {}", exception.getClass().getSimpleName());
        }
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        var token = consume(rawToken, AccountTokenType.PASSWORD_RESET);
        var user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        sessionService.revokeAll(user);
    }

    private String issue(User user, AccountTokenType type, Duration expiration) {
        var now = Instant.now();
        tokenRepository.invalidateForUser(user.getId(), type, now);
        var rawToken = TokenHashing.newToken();
        var token = new AccountToken();
        token.setUser(user);
        token.setTokenHash(TokenHashing.sha256(rawToken));
        token.setTokenType(type);
        token.setCreatedAt(now);
        token.setExpiresAt(now.plus(expiration));
        tokenRepository.save(token);
        return rawToken;
    }

    private AccountToken consume(String rawToken, AccountTokenType type) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Invalid or expired token");
        }
        var token = tokenRepository.findUsable(TokenHashing.sha256(rawToken), type, Instant.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        token.setUsedAt(Instant.now());
        return token;
    }

    @Transactional
    @Scheduled(cron = "${api.security.account-token.cleanup-cron:0 30 * * * *}")
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(Instant.now().minus(Duration.ofDays(1)));
    }
}
