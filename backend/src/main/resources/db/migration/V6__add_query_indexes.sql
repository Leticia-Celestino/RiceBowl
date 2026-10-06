CREATE INDEX idx_rices_created_at ON rices (created_at DESC);
CREATE INDEX idx_rices_user_created_at ON rices (user_id, created_at DESC);
CREATE INDEX idx_rices_distro ON rices (LOWER(distro));
CREATE INDEX idx_rices_window_manager ON rices (LOWER(window_manager));
CREATE INDEX idx_comments_rice_created_at ON comments (rice_id, created_at);
CREATE INDEX idx_rice_images_rice_id ON rice_images (rice_id);
CREATE INDEX idx_rice_votes_user_id ON rice_votes (user_id);
