package com.ricebowl.api.domain.rice;

import java.util.Optional;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;

import com.ricebowl.api.domain.file.FileService;
import com.ricebowl.api.domain.rice.dto.CommentDTO;
import com.ricebowl.api.domain.rice.dto.CommentResponseDTO;
import com.ricebowl.api.domain.rice.dto.RiceCreateDTO;
import com.ricebowl.api.domain.rice.dto.RiceDetailDTO;
import com.ricebowl.api.domain.rice.dto.RiceSummaryDTO;
import com.ricebowl.api.domain.tag.Tag;
import com.ricebowl.api.domain.tag.TagRepository;
import com.ricebowl.api.domain.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RiceService {

    private final RiceRepository riceRepository;
    private final TagRepository tagRepository;
    private final FileService fileService;
    private final RiceImageRepository riceImageRepository;
    private final RiceVoteRepository voteRepository;
    private final CommentRepository commentRepository;

    @Value("${app.draft-retention:PT24H}")
    private Duration draftRetention;

    @Transactional
    public RiceDetailDTO create(RiceCreateDTO data, User user) {
        Set<Tag> tags = data.tags().stream()
                .map(tagName -> tagRepository.findByName(tagName.toLowerCase())
                        .orElseGet(() -> tagRepository.save(new Tag(null, tagName.toLowerCase()))))
                .collect(Collectors.toSet());

        var rice = new Rice();
        rice.setTitle(data.title());
        rice.setDescription(data.description());
        rice.setDistro(data.distro());
        rice.setWindowManager(data.windowManager());
        rice.setUser(user);
        rice.setTags(tags);

        riceRepository.save(rice);
        return detail(rice);
    }

    @Transactional(readOnly = true)
    public Page<RiceSummaryDTO> findAll(String search, String distro, String windowManager, String author, Pageable pageable) {
        return riceRepository.searchRices(RiceStatus.PUBLISHED, search, distro, windowManager, author, pageable)
                .map(rice -> new RiceSummaryDTO(rice, fileService::publicUrl));
    }

    @Transactional(readOnly = true)
    public RiceDetailDTO findById(java.util.UUID id) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));
        return detail(rice);
    }

    @Transactional
    public void delete(java.util.UUID id, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to delete this rice");
        }

        deleteStoredFiles(rice);
        riceRepository.delete(rice);
    }

    @Transactional
    public RiceDetailDTO uploadCover(UUID id, org.springframework.web.multipart.MultipartFile file, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
        }

        String previousCover = rice.getCoverUrl();
        String coverUrl = fileService.uploadImage(file);
        rice.setCoverUrl(coverUrl);
        publishWhenComplete(rice);
        fileService.deleteByUrl(previousCover);
        
        return detail(rice);
    }

    @Transactional
    public RiceDetailDTO uploadConfig(UUID id, org.springframework.web.multipart.MultipartFile file, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
        }

        String previousConfig = rice.getConfigUrl();
        String configUrl = fileService.uploadArchive(file);
        rice.setConfigUrl(configUrl);
        publishWhenComplete(rice);
        fileService.deleteByUrl(previousConfig);
        
        return detail(rice);
    }

    @Transactional
    public RiceDetailDTO addImageToGallery(UUID id, org.springframework.web.multipart.MultipartFile file, String description, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
        }

        String imageUrl = fileService.uploadImage(file);

        RiceImage novaImagem = new RiceImage();
        novaImagem.setRice(rice);
        novaImagem.setUrl(imageUrl);
        novaImagem.setDescription(description);

        riceImageRepository.save(novaImagem);

        return detail(rice);
    }

    @Transactional
    public Long voteRice(UUID riceId, Short value, User user) {
        if (value == null || (value != 1 && value != -1)) {
            throw new IllegalArgumentException("Vote value must be 1 or -1");
        }

        Rice rice = riceRepository.findById(riceId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        Optional<RiceVote> existingVote = voteRepository.findByRiceIdAndUserId(riceId, user.getId());

        if (existingVote.isPresent()) {
            RiceVote vote = existingVote.get();
            if (vote.getVoteValue().equals(value)) {
                voteRepository.delete(vote);
            } else {
                vote.setVoteValue(value);
                voteRepository.save(vote);
            }
        } else {
            RiceVote newVote = new RiceVote();
            newVote.setId(new RiceVote.RiceVoteId(rice.getId(), user.getId()));
            newVote.setRice(rice);
            newVote.setUser(user);
            newVote.setVoteValue(value);
            
            voteRepository.save(newVote);
        }

        return voteRepository.calculateTotalKarmaByRiceId(riceId);
    }

    @Transactional
    public CommentResponseDTO addComment(UUID riceId, CommentDTO dto, User user) {
        Rice rice = riceRepository.findById(riceId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        Comment comment = new Comment();
        comment.setContent(dto.content().trim());
        comment.setRice(rice);
        comment.setAuthor(user);
        
        return new CommentResponseDTO(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> listComments(UUID riceId) {
        if (!riceRepository.existsById(riceId)) {
            throw new jakarta.persistence.EntityNotFoundException("Rice not found");
        }

        return commentRepository.findByRiceIdOrderByCreatedAtAsc(riceId)
                .stream()
                .map(CommentResponseDTO::new)
                .toList();
    }

    @Transactional
    @Scheduled(
            fixedDelayString = "${app.draft-cleanup-interval-ms:3600000}",
            initialDelayString = "${app.draft-cleanup-initial-delay-ms:60000}")
    public void cleanupExpiredDrafts() {
        var cutoff = LocalDateTime.now().minus(draftRetention);
        var drafts = riceRepository.findByStatusAndCreatedAtBefore(RiceStatus.DRAFT, cutoff);
        drafts.forEach(this::deleteStoredFiles);
        riceRepository.deleteAll(drafts);
    }

    private void publishWhenComplete(Rice rice) {
        if (rice.getCoverUrl() != null && rice.getConfigUrl() != null) {
            rice.setStatus(RiceStatus.PUBLISHED);
        }
    }

    private RiceDetailDTO detail(Rice rice) {
        return new RiceDetailDTO(rice, fileService::publicUrl);
    }

    private void deleteStoredFiles(Rice rice) {
        fileService.deleteByUrl(rice.getCoverUrl());
        fileService.deleteByUrl(rice.getConfigUrl());
        rice.getGallery().forEach(image -> fileService.deleteByUrl(image.getUrl()));
    }
}
