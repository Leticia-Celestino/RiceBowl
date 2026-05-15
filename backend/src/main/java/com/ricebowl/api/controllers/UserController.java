package com.ricebowl.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ricebowl.api.domain.user.User;
import com.ricebowl.api.domain.user.dto.UserResponseDTO;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserResponseDTO(user.getId(), user.getNickname(), user.getEmail(), user.getBio()));
    }
}