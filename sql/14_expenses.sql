-- =================================================================
-- SECTION 1: EXPENSE CATEGORIES
-- =================================================================
CREATE TABLE expense_categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280', -- Default gray color
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE expense_categories IS 'Categorizes expenses for better tracking and analysis.';

-- Insert default expense categories
INSERT INTO expense_categories (name, description, color) VALUES
    ('Inventory', 'Product purchases and raw materials', '#3B82F6'),      -- Blue
    ('Marketing', 'Advertising and promotional expenses', '#8B5CF6'),     -- Purple
    ('Shipping', 'Delivery and shipping costs', '#F59E0B'),               -- Amber
    ('Utilities', 'Electricity, water, internet, phone', '#10B981'),      -- Green
    ('Salaries', 'Employee wages and benefits', '#EF4444'),               -- Red
    ('Rent', 'Office or warehouse rent', '#EC4899'),                      -- Pink
    ('Equipment', 'Tools, machinery, and equipment', '#6366F1'),          -- Indigo
    ('Other', 'Miscellaneous expenses', '#6B7280');                       -- Gray

-- =================================================================
-- SECTION 2: EXPENSES
-- =================================================================
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    description TEXT NOT NULL,
    vendor TEXT,
    payment_method TEXT, -- e.g., 'cash', 'transfer', 'card'
    receipt_url TEXT,
    notes TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE expenses IS 'Tracks all business expenses for profitability analysis.';

-- =================================================================
-- SECTION 3: INDEXES
-- =================================================================
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);
CREATE INDEX idx_expense_categories_is_active ON expense_categories(is_active);

-- =================================================================
-- SECTION 4: TRIGGERS FOR UPDATED_AT
-- =================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expense_categories_updated_at
    BEFORE UPDATE ON expense_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
