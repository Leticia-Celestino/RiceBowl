package com.ricebowl.api.domain.rice;

import com.ricebowl.api.domain.tag.Tag;
import com.ricebowl.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.List;

@Entity(name = "Rice")
@Table(name = "rices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Rice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    private String distro; 
    private String windowManager; 
    private String coverUrl;
    private String configUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; 

    @ManyToMany
    @JoinTable(
        name = "rice_tags",
        joinColumns = @JoinColumn(name = "rice_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "rice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RiceImage> gallery = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_rice_id")
    private Rice parentRice;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(SUM(v.vote_value), 0) FROM rice_votes v WHERE v.rice_id = id)")
    private Long karma;

    @OneToMany(mappedBy = "rice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private java.util.List<Comment> comments = new java.util.ArrayList<>();

    @org.hibernate.annotations.Formula("(SELECT COUNT(c.id) FROM comments c WHERE c.rice_id = id)")
    private Long commentCount;
}
