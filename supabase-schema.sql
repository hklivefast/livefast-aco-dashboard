-- LIVEFAST ACO Database Schema
-- Run this in Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Orders table: stores all scraped order data per member
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  retailer TEXT NOT NULL,
  order_number TEXT,
  item TEXT NOT NULL,
  order_date DATE,
  status TEXT DEFAULT 'Confirmed',
  total NUMERIC(10, 2),
  last_scanned TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for upsert by user + order number
  CONSTRAINT unique_user_order UNIQUE (user_id, order_number)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders (user_id, order_date DESC);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: service role can do everything (our API uses service key)
CREATE POLICY "Service role full access" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
