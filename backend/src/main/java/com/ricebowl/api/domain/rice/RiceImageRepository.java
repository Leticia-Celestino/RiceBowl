package com.ricebowl.api.domain.rice;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RiceImageRepository extends JpaRepository<RiceImage, UUID> {
}