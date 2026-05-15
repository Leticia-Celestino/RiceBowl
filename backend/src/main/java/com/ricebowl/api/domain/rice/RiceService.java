package com.ricebowl.api.domain.rice;

import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    public Page<RiceDetailDTO> findAll(Pageable pageable) {
        return riceRepository.findAll(pageable).map(RiceDetailDTO::new);
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
}