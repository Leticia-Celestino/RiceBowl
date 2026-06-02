package com.ricebowl.api.domain.rice;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RiceVoteRepository extends JpaRepository<RiceVote, RiceVote.RiceVoteId> {

    Optional<RiceVote> findByRiceIdAndUserId(UUID riceId, UUID userId);
    
    @Query("SELECT COALESCE(SUM(v.voteValue), 0L) FROM RiceVote v WHERE v.rice.id = :riceId")
    Long calculateTotalKarmaByRiceId(@Param("riceId") UUID riceId);

    @Query("SELECT COALESCE(SUM(v.voteValue), 0L) FROM RiceVote v WHERE v.rice.user.id = :userId")
    Long calculateTotalKarmaByUserId(@Param("userId") UUID userId);
}