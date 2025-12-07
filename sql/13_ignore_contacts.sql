CREATE TABLE hidden_contacts (
    user_contact_id BIGINT NOT NULL REFERENCES contacts(id),
    hidden_contact_id BIGINT NOT NULL REFERENCES contacts(id),

    PRIMARY KEY (user_contact_id, hidden_contact_id)
);
