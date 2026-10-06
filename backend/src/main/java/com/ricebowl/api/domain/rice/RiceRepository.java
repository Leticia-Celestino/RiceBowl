package com.ricebowl.api.domain.rice;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;

public interface RiceRepository extends JpaRepository<Rice, UUID> {

    @EntityGraph(attributePaths = {"user"})
    @Query(value = "SELECT DISTINCT r FROM Rice r WHERE " +
        "(:search IS NULL OR :search = '' OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
        "AND (:distro IS NULL OR :distro = '' OR LOWER(r.distro) = LOWER(:distro)) " +
        "AND (:windowManager IS NULL OR :windowManager = '' OR LOWER(r.windowManager) = LOWER(:windowManager)) " +
        "AND (:author IS NULL OR :author = '' OR LOWER(r.user.nickname) = LOWER(:author))",
        countQuery = "SELECT COUNT(r) FROM Rice r WHERE " +
        "(:search IS NULL OR :search = '' OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
        "AND (:distro IS NULL OR :distro = '' OR LOWER(r.distro) = LOWER(:distro)) " +
        "AND (:windowManager IS NULL OR :windowManager = '' OR LOWER(r.windowManager) = LOWER(:windowManager)) " +
        "AND (:author IS NULL OR :author = '' OR LOWER(r.user.nickname) = LOWER(:author))")
    Page<Rice> searchRices(
            @Param("search") String search, 
            @Param("distro") String distro, 
            @Param("windowManager") String windowManager, 
            @Param("author") String author, 
            Pageable pageable
    );
    Long countByUserId(UUID userId);
}
