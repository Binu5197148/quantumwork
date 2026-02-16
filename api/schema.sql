-- Schema for Quantum Work Database
-- Table: candidates

CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    primary_skill TEXT NOT NULL,
    experience TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster search by skill
CREATE INDEX IF NOT EXISTS idx_candidates_skill ON candidates(primary_skill);

-- Index for faster search by email
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
