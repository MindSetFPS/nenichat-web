-- Add order_number column to orders table (business-scoped sequential order numbers)
-- This allows each business to have their orders numbered starting from 1

-- 1. Add the order_number column
ALTER TABLE orders ADD COLUMN order_number INTEGER NOT NULL DEFAULT 0;

-- 2. Create trigger function to auto-increment order_number per business
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(order_number), 0) + 1
  INTO NEW.order_number
  FROM orders
  WHERE business_id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS set_order_number_trigger ON orders;
CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- 4. Populate existing orders with sequential numbers per business (one-time migration)
UPDATE orders o
SET order_number = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY business_id ORDER BY created_at) as rn
  FROM orders
) sub
WHERE o.id = sub.id;
