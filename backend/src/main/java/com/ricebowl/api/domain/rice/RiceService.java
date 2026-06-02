package com.ricebowl.api.domain.rice;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ricebowl.api.domain.file.FileService;
import com.ricebowl.api.domain.rice.dto.CommentDTO;
import com.ricebowl.api.domain.rice.dto.RiceCreateDTO;
import com.ricebowl.api.domain.rice.dto.RiceDetailDTO;
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
        return new RiceDetailDTO(rice);
    }

    public Page<RiceDetailDTO> findAll(String search, String distro, String windowManager, String author, Pageable pageable) {
        return riceRepository.searchRices(search, distro, windowManager, author, pageable)
                .map(RiceDetailDTO::new);
    }

    public RiceDetailDTO findById(java.util.UUID id) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));
        return new RiceDetailDTO(rice);
    }

    @Transactional
    public void delete(java.util.UUID id, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to delete this rice");
        }

        riceRepository.delete(rice);
    }

    @Transactional
    public RiceDetailDTO uploadCover(UUID id, org.springframework.web.multipart.MultipartFile file, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
        }

        String coverUrl = fileService.upload(file);
        rice.setCoverUrl(coverUrl);
        
        return new RiceDetailDTO(rice);
    }

    @Transactional
    public RiceDetailDTO uploadConfig(UUID id, org.springframework.web.multipart.MultipartFile file, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
        }

        String configUrl = fileService.upload(file);
        rice.setConfigUrl(configUrl);
        
        return new RiceDetailDTO(rice);
    }

    @Transactional
    public RiceDetailDTO addImageToGallery(UUID id, org.springframework.web.multipart.MultipartFile file, String description, User user) {
        var rice = riceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        if (!rice.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
        }

        String imageUrl = fileService.upload(file);

        RiceImage novaImagem = new RiceImage();
        novaImagem.setRice(rice);
        novaImagem.setUrl(imageUrl);
        novaImagem.setDescription(description);

        riceImageRepository.save(novaImagem);

        return new RiceDetailDTO(rice);
    }

    @Transactional
    public Long voteRice(UUID riceId, Short value, User user) {
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
    public void addComment(UUID riceId, CommentDTO dto, User user) {
        Rice rice = riceRepository.findById(riceId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

        Comment comment = new Comment();
        comment.setContent(dto.content());
        comment.setRice(rice);
        comment.setAuthor(user);
        
        commentRepository.save(comment);
    }
}