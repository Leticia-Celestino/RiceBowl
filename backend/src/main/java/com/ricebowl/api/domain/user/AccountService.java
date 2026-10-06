package com.ricebowl.api.domain.user;

import com.ricebowl.api.domain.user.dto.RegisterDTO;
import com.ricebowl.api.infra.security.AccountTokenService;
import com.ricebowl.api.infra.security.SessionService;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AccountTokenService tokenService;
    private final SessionService sessionService;
    private final boolean verificationRequired;

    public AccountService(
            UserRepository repository,
            PasswordEncoder passwordEncoder,
            AccountTokenService tokenService,
            SessionService sessionService,
            @Value("${api.security.email-verification.required:false}") boolean verificationRequired) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.sessionService = sessionService;
        this.verificationRequired = verificationRequired;
    }

    @Transactional
    public void register(RegisterDTO data) {
        var email = normalizeEmail(data.email());
        var nickname = data.nickname().trim();
        var encodedPassword = passwordEncoder.encode(data.password());
        if (repository.existsByEmailIgnoreCase(email) || repository.existsByNicknameIgnoreCase(nickname)) {
            return;
        }
        var user = new User(nickname, email, encodedPassword, !verificationRequired);
        repository.save(user);
        if (verificationRequired) tokenService.sendVerification(user);
    }

    @Transactional
    public void resendVerification(String email) {
        repository.findUserByEmailIgnoreCase(normalizeEmail(email))
                .filter(user -> !user.isEmailVerified())
                .ifPresent(tokenService::sendVerification);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        repository.findUserByEmailIgnoreCase(normalizeEmail(email))
                .filter(User::isEmailVerified)
                .ifPresent(tokenService::requestPasswordReset);
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
        sessionService.revokeAll(user);
    }

    public String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
