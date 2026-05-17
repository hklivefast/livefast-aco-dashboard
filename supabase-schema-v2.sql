-- LIVEFAST ACO Database Schema v2
-- Run this in Supabase SQL Editor

-- Email accounts table: stores linked email connections per member
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL,
  provider TEXT NOT NULL,
  email TEXT NOT NULL,
  imap_server TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  last_scanned TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_email UNIQUE (user_id, email)
);

CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts (user_id);

-- Add email_account_id to orders if not exists
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Discord webhook settings per user
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  discord_webhook_url TEXT,
  notify_new_order BOOLEAN DEFAULT true,
  notify_shipped BOOLEAN DEFAULT true,
  notify_delivered BOOLEAN DEFAULT true,
  notify_cancelled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings (user_id);

-- Auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS policies
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role full access" ON email_accounts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access" ON user_settings FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
