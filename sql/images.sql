CREATE TABLE images (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
