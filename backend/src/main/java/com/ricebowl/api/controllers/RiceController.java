package com.ricebowl.api.controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.ricebowl.api.domain.rice.RiceService;
import com.ricebowl.api.domain.rice.dto.CommentDTO;
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
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String distro,
            @RequestParam(required = false) String windowManager,
            @RequestParam(required = false) String author, 
            @PageableDefault(size = 10, sort = {"createdAt"}) Pageable pageable
    ) {
        var page = riceService.findAll(search, distro, windowManager, author, pageable);
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
    
    @PatchMapping(value = "/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RiceDetailDTO> uploadCover(
        @PathVariable UUID id,
        @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
        @AuthenticationPrincipal User user
    ){
        var response = riceService.uploadCover(id, file, user);
        return ResponseEntity.ok(response);
    }

    @PatchMapping(value = "/{id}/config", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RiceDetailDTO> uploadConfig(
        @PathVariable UUID id,
        @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
        @AuthenticationPrincipal User user
    ) {
        var response = riceService.uploadConfig(id, file, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RiceDetailDTO> addImageToGallery(
        @PathVariable UUID id,
        @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
        @RequestParam(value = "description", required = false) String description,
        @AuthenticationPrincipal User user
    ) {
        var response = riceService.addImageToGallery(id, file, description, user);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/{id}/vote")
    public ResponseEntity<Long> voteRice(
            @PathVariable UUID id, 
            @RequestParam Short value, 
            @AuthenticationPrincipal User user
    ) {
        Long newKarma = riceService.voteRice(id, value, user);
        return ResponseEntity.ok(newKarma);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Void> addComment(
            @PathVariable UUID id, 
            @RequestBody @Valid CommentDTO dto, 
            @AuthenticationPrincipal User user
    ) {
        riceService.addComment(id, dto, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}