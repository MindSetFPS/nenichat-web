-- 2.5. AUDIENCE_CONTACTS TABLE (Many-to-Many Join Table)
CREATE TABLE audience_contacts (
    id BIGSERIAL PRIMARY KEY,
    audience_id BIGINT NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    -- Ensure a contact can only be in an audience once.
    UNIQUE (audience_id, contact_id)
);