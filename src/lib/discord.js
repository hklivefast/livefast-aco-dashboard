// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const LIVEFAST_ACO_ROLE_ID = process.env.DISCORD_LIVEFAST_ROLE_ID;

// Generate Discord OAuth URL
export function getDiscordAuthUrl() {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email guilds guilds.members.read",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

// Exchange code for tokens
export async function exchangeCode(code) {
  const res = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord token exchange failed: ${err}`);
  }
  return res.json();
}

// Get Discord user info
export async function getDiscordUser(accessToken) {
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Discord user");
  return res.json();
}

// Check if user has the LIVEFAST ACO role in the guild using bot token
export async function checkUserRole(discordUserId) {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !LIVEFAST_ACO_ROLE_ID) {
    console.warn("Discord bot/guild/role config missing, skipping role check");
    return true; // Allow access if not configured yet
  }

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}`,
    {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    }
  );

  if (!res.ok) {
    if (res.status === 404) return false; // Not in guild
    throw new Error(`Failed to check guild member: ${res.status}`);
  }

  const member = await res.json();
  return member.roles.includes(LIVEFAST_ACO_ROLE_ID);
}

// Refresh access token
export async function refreshToken(refresh_token) {
  const res = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token,
    }),
  });
  if (!res.ok) throw new Error("Failed to refresh Discord token");
  return res.json();
}
