# Orders

Our chat-oriented app requires a different approach torwards ordering than a traditional app.

An order is started the momment a message has a buy intent. Multiple messages can compose an order.

An order is completed when the user has paid for it.

An order is cancelled when the user has cancelled it.

So, an order is a moment in time between a buy intent and a payment or cancellation.

A database design for this would be:

- Order
    - id
    - contact_id
    - created_at
    - updated_at
    - completed_at
    - cancelled_at

```sql
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ, -- The order was fulfilled and we were paid
    cancelled_at TIMESTAMPTZ, -- The order was cancelled
);
```

adding the completed_at and cancelled_at to current table:

```sql
ALTER TABLE orders ADD COLUMN completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMPTZ;
```
