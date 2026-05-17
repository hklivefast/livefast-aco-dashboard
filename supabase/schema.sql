-- LIVEFAST ACO Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (synced from Discord OAuth)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_id TEXT UNIQUE NOT NULL,
  discord_username TEXT,
  discord_avatar TEXT,
  email TEXT,
  discord_access_token TEXT,
  discord_refresh_token TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEMBER PROFILES (onboarding data)
-- ============================================================
CREATE TABLE member_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  shipping_address JSONB, -- { street, city, state, zip }
  walmart_email TEXT,
  target_email TEXT,
  pokemon_center_email TEXT,
  sams_club_email TEXT,
  amazon_email TEXT,
  bestbuy_email TEXT,
  notes TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- ORDERS (scraped from email / manually entered)
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number TEXT,
  retailer TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  order_date TIMESTAMPTZ,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed','processing','shipped','delivered','cancelled','returned')),
  tracking_number TEXT,
  carrier TEXT,
  tracking_status TEXT,
  eta TIMESTAMPTZ,
  raw_email_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_retailer ON orders(retailer);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

-- ============================================================
-- INVOICES (PAS fee tracking)
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pas_fee_rate DECIMAL(5,2) DEFAULT 18.00,
  pas_fee_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  issued_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================
-- DROPS (scheduled checkout events)
-- ============================================================
CREATE TABLE drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  drop_date DATE NOT NULL,
  drop_time TEXT,
  retailer TEXT NOT NULL,
  products TEXT,
  total_slots INTEGER DEFAULT 10,
  filled_slots INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed','cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DROP SIGNUPS (member -> drop)
-- ============================================================
CREATE TABLE drop_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID REFERENCES drops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drop_id, user_id)
);

-- ============================================================
-- EMAIL ACCOUNTS (for order scraping)
-- ============================================================
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  account_type TEXT DEFAULT 'gmail' CHECK (account_type IN ('gmail','imap','outlook')),
  imap_server TEXT,
  imap_port INTEGER DEFAULT 993,
  -- Encrypted credentials stored separately or via OAuth
  oauth_token TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','error','disconnected')),
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISCORD WEBHOOK CONFIG
-- ============================================================
CREATE TABLE webhook_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  webhook_url TEXT,
  notify_new_order BOOLEAN DEFAULT TRUE,
  notify_shipped BOOLEAN DEFAULT TRUE,
  notify_delivered BOOLEAN DEFAULT TRUE,
  notify_cancelled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_member_profiles_timestamp BEFORE UPDATE ON member_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_timestamp BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_drops_timestamp BEFORE UPDATE ON drops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_webhook_config_timestamp BEFORE UPDATE ON webhook_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_config ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS for API routes
-- Individual user policies can be added later when needed
