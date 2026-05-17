const DISCORD_API = "https://discord.com/api/v10";

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    response_type: "code",
    scope: "identify guilds.members.read",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode(code) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json();
}

export async function getUser(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function getGuildMember(accessToken) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const res = await fetch(
    `${DISCORD_API}/users/@me/guilds/${guildId}/member`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch guild member");
  return res.json();
}

export function hasRequiredRole(member) {
  if (!member || !member.roles) return false;
  return member.roles.includes(process.env.DISCORD_REQUIRED_ROLE_ID);
}
