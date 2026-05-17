-- LIVEFAST ACO Database Schema v3 - Order Tracking Upgrade
-- Run this in Supabase SQL Editor AFTER v1 and v2

-- Add new columns to orders table for full lifecycle tracking
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_json JSONB;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_type TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS raw_subject TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_date DATE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_date DATE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_ready BOOLEAN DEFAULT false;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax NUMERIC(10, 2);
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 1;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders (tracking_number) WHERE tracking_number IS NOT NULL;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (user_id, status);

-- Index for retailer filtering
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON orders (user_id, retailer);
