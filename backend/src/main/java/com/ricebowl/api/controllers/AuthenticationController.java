package com.ricebowl.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ricebowl.api.domain.user.User;
import com.ricebowl.api.domain.user.AccountService;
import com.ricebowl.api.domain.user.dto.AuthenticationDTO;
import com.ricebowl.api.domain.user.dto.EmailRequestDTO;
import com.ricebowl.api.domain.user.dto.LoginResponseDTO;
import com.ricebowl.api.domain.user.dto.PasswordChangeDTO;
import com.ricebowl.api.domain.user.dto.PasswordResetDTO;
import com.ricebowl.api.domain.user.dto.RegisterDTO;
import com.ricebowl.api.domain.user.dto.TokenRequestDTO;
import com.ricebowl.api.infra.security.AccountTokenService;
import com.ricebowl.api.infra.security.AuthCookieService;
import com.ricebowl.api.infra.security.RateLimitService;
import com.ricebowl.api.infra.security.SessionService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final AccountService accountService;
    private final AccountTokenService accountTokenService;
    private final SessionService sessionService;
    private final AuthCookieService authCookieService;
    private final RateLimitService rateLimitService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody @Valid AuthenticationDTO data,
            HttpServletRequest request,
            HttpServletResponse response) {
        var email = accountService.normalizeEmail(data.email());
        rateLimitService.check("login-ip", rateLimitService.clientAddress(request), 30, Duration.ofMinutes(15));
        rateLimitService.check("login-account", email, 10, Duration.ofMinutes(15));
        var usernamePassword = new UsernamePasswordAuthenticationToken(email, data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        rateLimitService.reset("login-account", email);

        User user = (User) auth.getPrincipal();
        var sessionToken = sessionService.create(user);
        authCookieService.write(response, sessionToken);
        var responseUser = new com.ricebowl.api.domain.user.dto.UserResponseDTO(
                user.getId(), user.getNickname(), user.getEmail(), user.getBio());

        return ResponseEntity.ok(new LoginResponseDTO(responseUser));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        sessionService.revoke(authCookieService.read(request));
        authCookieService.clear(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken());
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @RequestBody @Valid RegisterDTO data,
            HttpServletRequest request) {
        rateLimitService.check("register-ip", rateLimitService.clientAddress(request), 10, Duration.ofHours(1));
        rateLimitService.check("register-account", accountService.normalizeEmail(data.email()), 5, Duration.ofHours(1));
        accountService.register(data);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(
            @RequestBody @Valid TokenRequestDTO data,
            HttpServletRequest request) {
        rateLimitService.check("verify-email-ip", rateLimitService.clientAddress(request), 20, Duration.ofHours(1));
        accountTokenService.verifyEmail(data.token());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(
            @RequestBody @Valid EmailRequestDTO data,
            HttpServletRequest request) {
        rateLimitService.check("resend-verification-ip", rateLimitService.clientAddress(request), 5, Duration.ofHours(1));
        rateLimitService.check("resend-verification-account", accountService.normalizeEmail(data.email()), 3, Duration.ofHours(1));
        accountService.resendVerification(data.email());
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @RequestBody @Valid EmailRequestDTO data,
            HttpServletRequest request) {
        rateLimitService.check("forgot-password-ip", rateLimitService.clientAddress(request), 5, Duration.ofHours(1));
        rateLimitService.check("forgot-password-account", accountService.normalizeEmail(data.email()), 3, Duration.ofHours(1));
        accountService.requestPasswordReset(data.email());
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @RequestBody @Valid PasswordResetDTO data,
            HttpServletRequest request) {
        rateLimitService.check("reset-password-ip", rateLimitService.clientAddress(request), 10, Duration.ofHours(1));
        accountTokenService.resetPassword(data.token(), data.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody @Valid PasswordChangeDTO data,
            @AuthenticationPrincipal User user,
            HttpServletResponse response) {
        accountService.changePassword(user, data.currentPassword(), data.newPassword());
        authCookieService.write(response, sessionService.create(user));
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
