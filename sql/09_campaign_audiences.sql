-- 2.4. CAMPAIGN_AUDIENCES TABLE (Many-to-Many Join Table)
CREATE TABLE campaign_audiences (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    audience_id BIGINT NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
    -- Ensure a campaign can only be linked to an audience once.
    UNIQUE (campaign_id, audience_id)
);

COMMENT ON TABLE campaign_audiences IS 'Links campaigns to audiences (many-to-many).';

