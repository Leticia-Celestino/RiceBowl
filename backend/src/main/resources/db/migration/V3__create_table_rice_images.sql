CREATE TABLE rice_images (
    id UUID PRIMARY KEY,
    rice_id UUID NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_rice_images_rice FOREIGN KEY (rice_id) REFERENCES rices (id) ON DELETE CASCADE
);