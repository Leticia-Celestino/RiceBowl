-- 1. A Função "Branch" (Fork de Setups)
ALTER TABLE rices ADD COLUMN parent_rice_id UUID;
ALTER TABLE rices ADD CONSTRAINT fk_parent_rice FOREIGN KEY (parent_rice_id) REFERENCES rices(id) ON DELETE SET NULL;

-- 2. O Sistema de Karma (Reddit-style: Upvotes e Downvotes)
CREATE TABLE rice_votes (
    rice_id UUID NOT NULL,
    user_id UUID NOT NULL,
    vote_value SMALLINT NOT NULL CHECK (vote_value IN (1, -1)),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rice_id, user_id),
    CONSTRAINT fk_vote_rice FOREIGN KEY (rice_id) REFERENCES rices(id) ON DELETE CASCADE,
    CONSTRAINT fk_vote_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- 3. O Fórum (Comentários)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    rice_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_rice FOREIGN KEY (rice_id) REFERENCES rices(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);