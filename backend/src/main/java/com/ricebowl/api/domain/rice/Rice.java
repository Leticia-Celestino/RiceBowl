package com.ricebowl.api.domain.rice;

import com.ricebowl.api.domain.tag.Tag;
import com.ricebowl.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

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

    @CreationTimestamp
    private LocalDateTime createdAt;

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
}