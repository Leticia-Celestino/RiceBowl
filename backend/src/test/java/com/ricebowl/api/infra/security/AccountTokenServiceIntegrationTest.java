package com.ricebowl.api.infra.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.ricebowl.api.domain.auth.AccountToken;
import com.ricebowl.api.domain.auth.AccountTokenRepository;
import com.ricebowl.api.domain.auth.AccountTokenType;
import com.ricebowl.api.domain.user.User;
import com.ricebowl.api.domain.user.UserRepository;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class AccountTokenServiceIntegrationTest {
    @Autowired private AccountTokenService tokenService;
    @Autowired private AccountTokenRepository tokenRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SessionService sessionService;
    @Autowired private PasswordEncoder passwordEncoder;

    @Test
    void verificationTokenIsHashedAndSingleUse() {
        var user = new User(unique("verify"), unique("verify") + "@example.test", passwordEncoder.encode("test-pass-123"), false);
        userRepository.saveAndFlush(user);
        var rawToken = TokenHashing.newToken();
        saveToken(user, rawToken, AccountTokenType.EMAIL_VERIFICATION);

        assertNotEquals(rawToken, tokenRepository.findAll().stream()
                .filter(token -> token.getUser().getId().equals(user.getId()))
                .findFirst().orElseThrow().getTokenHash());
        tokenService.verifyEmail(rawToken);
        assertTrue(userRepository.findById(user.getId()).orElseThrow().isEmailVerified());
        assertThrows(IllegalArgumentException.class, () -> tokenService.verifyEmail(rawToken));
    }

    @Test
    void passwordResetRevokesAllSessionsAndCannotBeReused() {
        var user = new User(unique("reset"), unique("reset") + "@example.test", passwordEncoder.encode("test-pass-123"), true);
        userRepository.saveAndFlush(user);
        var firstSession = sessionService.create(user);
        var secondSession = sessionService.create(user);
        var rawToken = TokenHashing.newToken();
        saveToken(user, rawToken, AccountTokenType.PASSWORD_RESET);

        tokenService.resetPassword(rawToken, "a-new-safe-password");

        assertTrue(passwordEncoder.matches("a-new-safe-password", userRepository.findById(user.getId()).orElseThrow().getPassword()));
        assertTrue(sessionService.authenticate(firstSession).isEmpty());
        assertTrue(sessionService.authenticate(secondSession).isEmpty());
        assertThrows(IllegalArgumentException.class,
                () -> tokenService.resetPassword(rawToken, "another-safe-password"));
        assertFalse(tokenRepository.findUsable(TokenHashing.sha256(rawToken), AccountTokenType.PASSWORD_RESET, Instant.now()).isPresent());
    }

    private void saveToken(User user, String rawToken, AccountTokenType type) {
        var token = new AccountToken();
        token.setUser(user);
        token.setTokenHash(TokenHashing.sha256(rawToken));
        token.setTokenType(type);
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plusSeconds(300));
        tokenRepository.saveAndFlush(token);
    }

    private String unique(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
