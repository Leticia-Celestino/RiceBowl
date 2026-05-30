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
import java.util.UUID;
import com.ricebowl.api.domain.file.FileService;

@Service
@RequiredArgsConstructor
public class RiceService {

    private final RiceRepository riceRepository;
    private final TagRepository tagRepository;
    private final FileService fileService;
    private final RiceImageRepository riceImageRepository;

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

    @Transactional
    public RiceDetailDTO uploadCover(UUID id, org.springframework.web.multipart.MultipartFile file, User user) {
    // 1. Busca o Rice no banco
    var rice = riceRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

    // 2. Trava de segurança: só o dono pode alterar a foto
    if (!rice.getUser().getId().equals(user.getId())) {
        throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
    }

    // 3. Faz o upload para o MinIO
    String coverUrl = fileService.upload(file);

    // 4. Atualiza o banco de dados com o link gerado
    rice.setCoverUrl(coverUrl);
    
    // O Hibernate salva automaticamente por causa do @Transactional
    return new RiceDetailDTO(rice);
    }

    @Transactional
    public RiceDetailDTO uploadConfig(UUID id, org.springframework.web.multipart.MultipartFile file, User user) {
    // 1. Busca o Rice
    var rice = riceRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

    // 2. Valida se o usuário é o dono
    if (!rice.getUser().getId().equals(user.getId())) {
        throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
    }

    // 3. Faz o upload (O FileService vai manter a extensão .tar.gz ou .zip automaticamente!)
    String configUrl = fileService.upload(file);

    // 4. Salva a URL dos dotfiles
    rice.setConfigUrl(configUrl);
    
    return new RiceDetailDTO(rice);
    }

    @Transactional
    public RiceDetailDTO addImageToGallery(UUID id, org.springframework.web.multipart.MultipartFile file, String description, User user) {
    // 1. Busca o Rice principal
    var rice = riceRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rice not found"));

    // 2. Trava de segurança (só o dono pode adicionar imagens)
    if (!rice.getUser().getId().equals(user.getId())) {
        throw new org.springframework.security.access.AccessDeniedException("You don't have permission to modify this rice");
    }

    // 3. Faz o upload da imagem para o MinIO
    String imageUrl = fileService.upload(file);

    // 4. Cria a nova entidade RiceImage
    RiceImage novaImagem = new RiceImage();
    novaImagem.setRice(rice);
    novaImagem.setUrl(imageUrl);
    novaImagem.setDescription(description);

    // 5. Salva a nova imagem no banco
    riceImageRepository.save(novaImagem);

    // O Hibernate e o DTO cuidarão de retornar o Rice atualizado com a galeria!
    return new RiceDetailDTO(rice);
}
}