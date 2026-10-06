package com.ricebowl.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ricebowl.api.domain.rice.RiceRepository;
import com.ricebowl.api.domain.rice.RiceStatus;
import com.ricebowl.api.domain.rice.RiceVoteRepository;
import com.ricebowl.api.domain.user.User;
import com.ricebowl.api.domain.user.UserRepository;
import com.ricebowl.api.domain.user.dto.UserProfileDTO;
import com.ricebowl.api.domain.user.dto.UserResponseDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RiceVoteRepository riceVoteRepository;
    private final RiceRepository riceRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(@AuthenticationPrincipal User user) {
        var response = new UserResponseDTO(
                user.getId(),
                user.getNickname(),
                user.getEmail(),
                user.getBio()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{nickname}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable String nickname) {
        User user = userRepository.findByNicknameIgnoreCase(nickname)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Usuário não encontrado"));
        Long totalKarma = riceVoteRepository.calculateTotalKarmaByUserId(user.getId());
        Long count = riceRepository.countByUserIdAndStatus(user.getId(), RiceStatus.PUBLISHED);
        var profile = new UserProfileDTO(
                user.getId(), 
                user.getNickname(), 
                user.getAvatarUrl(), 
                user.getBio(),
                totalKarma, 
                count
        );

        return ResponseEntity.ok(profile);
    }
}
