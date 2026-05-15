package com.ricebowl.api.controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;
import com.ricebowl.api.domain.rice.RiceService;
import com.ricebowl.api.domain.rice.dto.RiceCreateDTO;
import com.ricebowl.api.domain.rice.dto.RiceDetailDTO;
import com.ricebowl.api.domain.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rices")
@RequiredArgsConstructor
public class RiceController {

    private final RiceService riceService;

    @PostMapping
    public ResponseEntity<RiceDetailDTO> create(
            @RequestBody @Valid RiceCreateDTO data,
            @AuthenticationPrincipal User user,
            UriComponentsBuilder uriBuilder
    ) {
        var response = riceService.create(data, user);
        var uri = uriBuilder.path("/rices/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<RiceDetailDTO>> list(
            @PageableDefault(size = 10, sort = {"createdAt"}) Pageable pageable
    ) {
        var page = riceService.findAll(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiceDetailDTO> detail(@PathVariable UUID id) {
        var response = riceService.findById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        riceService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}