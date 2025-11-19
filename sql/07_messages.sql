-- 1.3. MESSAGES TABLE
CREATE TABLE messages (
    -- id BIGSERIAL PRIMARY KEY,
    id TEXT PRIMARY KEY, -- this value comes from whatsapp webhhook
    chat_id BIGSERIAL NOT NULL REFERENCES chats(id) ON DELETE CASCADE, -- this value is set by our database, it is NOT a phone number
    sender_id BIGSERIAL NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    text_content TEXT,
    -- timestamp TIMESTAMPTZ NOT NULL,
    replied_to_message_id TEXT,
    quoted_message_text TEXT,
    -- raw_from_field TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Stores all individual messages and their metadata.';
COMMENT ON COLUMN messages.sender_id IS 'Foreign key to the contact who sent the message.';