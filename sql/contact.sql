--- https://baileys.wiki/docs/migration/to-v7.0.0/

CREATE TABLE contacts (
    -- 1. The Surrogate Primary Key: Stable and Internal
    id BIGSERIAL PRIMARY KEY,

    -- 2. Business / Natural Keys: How users/systems find the contact
    phone_number VARCHAR(30) UNIQUE, -- Can be NULL if a contact might exist without a phone number in the future
    lid TEXT UNIQUE,                 -- The new local ID, can be NULL during transition

    -- 3. Other attributes
    username TEXT UNIQUE,            -- Twitter-like handle, should be unique if it exists
    pushname TEXT,                   -- WhatsApp display name, can be duplicated
    contact_name TEXT,               -- A name assigned by the system/user
    is_user BOOLEAN NOT NULL DEFAULT FALSE,

    -- 4. Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

    -- 5. Data Integrity Constraint
    -- CONSTRAINT chk_identifier_present CHECK (phone_number IS NOT NULL OR lid IS NOT NULL)
);