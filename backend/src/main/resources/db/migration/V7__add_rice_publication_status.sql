ALTER TABLE rices ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED';
CREATE INDEX idx_rices_status_created_at ON rices (status, created_at DESC);
