-- =================================================================
-- SECTION 1: CONTACT ADDRESSES
-- =================================================================
CREATE TABLE contact_addresses (
    id BIGSERIAL PRIMARY KEY,
    contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    label TEXT, -- e.g., 'Home', 'Work'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE contact_addresses IS 'Stores multiple shipping addresses for contacts.';

-- =================================================================
-- SECTION 2: orders
-- =================================================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Financials
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    
    -- Shipping Info
    shipping_address TEXT, -- Snapshot of address at time of sale
    status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    
    -- Payment Info
    payment_method TEXT, -- e.g., 'cash', 'transfer', 'card'
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    refunded_amount NUMERIC(10, 2) DEFAULT 0,
    payment_status TEXT CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')) DEFAULT 'unpaid',
    
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Stores orders transactions including payment and shipping status.';

-- =================================================================
-- SECTION 3: SALE ITEMS
-- =================================================================
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL, -- Preserve history if product is deleted
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL, -- Snapshot of price at time of sale
    total_price NUMERIC(10, 2) NOT NULL -- quantity * unit_price
);

COMMENT ON TABLE sale_items IS 'Stores individual items within a sale, linking to products.';

-- =================================================================
-- SECTION 4: INDEXES
-- =================================================================
CREATE INDEX idx_contact_addresses_contact_id ON contact_addresses(contact_id);
CREATE INDEX idx_orders_contact_id ON orders(contact_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
