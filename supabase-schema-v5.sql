-- LIVEFAST ACO - Schema v5: Add estimated_delivery column
-- Run this AFTER v1, v2, v3, and v4

ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- Index for quick lookups on in-transit orders with ETAs
CREATE INDEX IF NOT EXISTS idx_orders_eta ON orders (estimated_delivery) WHERE estimated_delivery IS NOT NULL;
