package com.ricebowl.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ricebowl.api.domain.user.User;
import com.ricebowl.api.domain.user.UserRepository;
import com.ricebowl.api.domain.user.dto.AuthenticationDTO;
import com.ricebowl.api.domain.user.dto.LoginResponseDTO;
import com.ricebowl.api.domain.user.dto.RegisterDTO;
import com.ricebowl.api.infra.security.TokenService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository repository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        User user = (User) auth.getPrincipal();
        var token = tokenService.generateToken(user);
        var responseUser = new com.ricebowl.api.domain.user.dto.UserResponseDTO(
                user.getId(), user.getNickname(), user.getEmail(), user.getBio());

        return ResponseEntity.ok(new LoginResponseDTO(token, responseUser));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid RegisterDTO data) {
        if (this.repository.existsByEmailIgnoreCase(data.email())
                || this.repository.existsByNicknameIgnoreCase(data.nickname())) {
            return ResponseEntity.badRequest().build();
        }

        String encryptedPassword = passwordEncoder.encode(data.password());
        User newUser = new User(data.nickname(), data.email(), encryptedPassword);

        this.repository.save(newUser);

        return ResponseEntity.ok().build();
    }
}
