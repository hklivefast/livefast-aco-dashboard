# LIVEFAST ACO

Automated Checkout Services dashboard for Pokemon TCG, sports cards, and collectibles.

## Stack

- **Frontend**: Next.js 14 (Pages Router), React, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (Postgres + RLS)
- **Auth**: Discord OAuth2 with role verification
- **Payments**: Stripe (invoicing)
- **Hosting**: Vercel

## Setup

1. Clone and install:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in values

3. Run Supabase migration:
   - Create a Supabase project
   - Run `supabase/schema.sql` in the SQL editor

4. Set up Discord OAuth:
   - Create an app at https://discord.com/developers
   - Add redirect URI: `https://your-domain/api/auth/callback`
   - Enable `identify`, `email`, `guilds`, `guilds.members.read` scopes
   - Create a bot and add it to your server with member read permissions

5. Run dev server:
```bash
npm run dev
```

## Architecture

```
src/
  components/    # React components (LandingPage, FullApp dashboard)
  lib/           # Supabase, Discord, session utilities
  pages/         # Next.js pages and API routes
    api/
      auth/      # Discord OAuth flow
      orders.js  # Order CRUD
      invoices.js # Invoice management
      drops.js   # Drop scheduling and signups
      onboarding.js # Member profile
      members.js # Admin member list
      stats.js   # Dashboard analytics
  styles/        # Global CSS + Tailwind
supabase/
  schema.sql     # Database migration
```
