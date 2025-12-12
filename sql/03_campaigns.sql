-- 2.1. CAMPAIGNS TABLE
CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    run_at TIMESTAMPTZ NULL,
    executed_at TIMESTAMPTZ NULL,
    status TEXT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE campaigns IS 'Stores marketing or notification campaigns.';
