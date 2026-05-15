package com.ricebowl.api.domain.rice;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiceRepository extends JpaRepository<Rice, UUID> {
}