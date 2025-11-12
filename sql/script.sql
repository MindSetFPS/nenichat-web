-- =================================================================
-- SECTION 1: CORE CHAT AND CONTACT TABLES (From previous request)
-- =================================================================

-- 1.1. CONTACTS TABLE (Shared table for both chat and campaigns)
COMMENT ON TABLE contacts IS 'Stores unique users/contacts, shared by messaging and campaign systems.';
COMMENT ON COLUMN contacts.phone_number IS 'The unique phone number identifier of the contact.';
COMMENT ON COLUMN contacts.pushname IS 'The display name of the contact, which can change.';

-- 1.2. CHATS TABLE
COMMENT ON TABLE chats IS 'Stores information about individual chat sessions.';
COMMENT ON COLUMN chats.chat_jid IS 'The unique Jabber ID for the chat (e.g., phone_number@s.whatsapp.net).';

-- =================================================================
-- SECTION 2: CAMPAIGN AND AUDIENCE MANAGEMENT TABLES (New request)
-- =================================================================
-- 2.6. RECIPIENTS TABLE
CREATE TABLE recipients (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    responded BOOLEAN NOT NULL DEFAULT FALSE,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    -- A contact should only be a recipient of a specific campaign once.
    UNIQUE (campaign_id, contact_id)
);

COMMENT ON TABLE recipients IS 'Tracks the status of each contact within a specific campaign.';
COMMENT ON COLUMN recipients.responded IS 'True if the contact replied to the campaign message.';
COMMENT ON COLUMN recipients.seen IS 'True if the campaign message has been seen by the contact.';

-- 2.3. CAMPAIGN_MESSAGES TABLE
-- Note: Renamed from campaign_message to follow plural naming convention.
CREATE TABLE campaign_messages (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

COMMENT ON TABLE campaign_messages IS 'Stores the message templates associated with a campaign.';
COMMENT ON COLUMN campaign_messages.campaign_id IS 'The campaign this message content belongs to.';

-- =================================================================
-- SECTION 3: INDEXES FOR PERFORMANCE
-- =================================================================

-- Indexes for Chat tables
CREATE INDEX idx_messages_chat_id_timestamp ON messages(chat_id, timestamp DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- Indexes for Campaign/Audience tables
CREATE INDEX idx_campaign_messages_campaign_id ON campaign_messages(campaign_id);
CREATE INDEX idx_campaign_audiences_campaign_id ON campaign_audiences(campaign_id);
CREATE INDEX idx_campaign_audiences_audience_id ON campaign_audiences(audience_id);
CREATE INDEX idx_audience_contacts_audience_id ON audience_contacts(audience_id);
CREATE INDEX idx_audience_contacts_contact_id ON audience_contacts(contact_id);
CREATE INDEX idx_recipients_campaign_id ON recipients(campaign_id);
CREATE INDEX idx_recipients_contact_id ON recipients(contact_id);