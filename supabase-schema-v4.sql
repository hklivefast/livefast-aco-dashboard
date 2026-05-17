-- LIVEFAST ACO Database Schema v4 - Drops Calendar + Admin Roles
-- Run this in Supabase SQL Editor AFTER v1, v2, v3

-- Drops calendar: upcoming product releases
CREATE TABLE IF NOT EXISTS drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  retailer TEXT,
  drop_date DATE NOT NULL,
  drop_time TIME,
  image_url TEXT,
  signup_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drops_date ON drops (drop_date DESC);

-- Admin users: Discord user IDs that have admin access
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_user_id TEXT UNIQUE NOT NULL,
  discord_username TEXT,
  granted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_discord ON admin_users (discord_user_id);

-- Auto-update triggers
DO $$ BEGIN
  CREATE TRIGGER drops_updated_at
    BEFORE UPDATE ON drops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS policies
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role full access" ON drops FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access" ON admin_users FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
