package com.ricebowl.api.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    UserDetails findByEmailIgnoreCase(String email);

    Optional<User> findUserByEmailIgnoreCase(String email);

    Optional<User> findByNicknameIgnoreCase(String nickname);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByNicknameIgnoreCase(String nickname);
}
