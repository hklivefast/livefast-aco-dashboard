-- ═══════════════════════════════════════════════════════════════
-- LIVEFAST ACO: Add Admin User
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Replace YOUR_DISCORD_USER_ID with your actual Discord user ID
-- (Enable Developer Mode in Discord > right-click your name > Copy User ID)

INSERT INTO admin_users (discord_user_id)
VALUES ('YOUR_DISCORD_USER_ID')
ON CONFLICT (discord_user_id) DO NOTHING;

-- Verify it worked:
SELECT * FROM admin_users;
