package com.ricebowl.api.domain.tag;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity(name = "Tag")
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;
}