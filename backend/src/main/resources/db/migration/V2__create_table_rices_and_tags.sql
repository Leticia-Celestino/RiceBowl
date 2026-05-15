CREATE TABLE tags (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE rices (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    distro VARCHAR(100),
    window_manager VARCHAR(100),
    cover_url TEXT,
    config_url TEXT,
    created_at TIMESTAMP NOT NULL,
    user_id UUID,

    CONSTRAINT fk_rices_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE rice_tags (
    rice_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    
    PRIMARY KEY (rice_id, tag_id),
    CONSTRAINT fk_rice_tags_rice FOREIGN KEY (rice_id) REFERENCES rices(id) ON DELETE CASCADE,
    CONSTRAINT fk_rice_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);