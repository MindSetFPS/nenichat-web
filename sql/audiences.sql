-- 2.2. AUDIENCES TABLE
CREATE TABLE audiences (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audiences IS 'Stores defined groups of contacts (audiences) for targeting.';