package com.ricebowl.api.domain.rice; 

import com.ricebowl.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rice_votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RiceVote {

    @EmbeddedId
    private RiceVoteId id = new RiceVoteId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("riceId") 
    @JoinColumn(name = "rice_id")
    private Rice rice;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") 
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "vote_value", nullable = false)
    private Short voteValue; 

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class RiceVoteId implements Serializable {
        private UUID riceId;
        private UUID userId;
    }
}