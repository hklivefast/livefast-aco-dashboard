import { exchangeCode, getDiscordUser, checkUserRole } from "../../lib/discord";
import { getServiceSupabase } from "../../lib/supabase";
import { setSessionCookie } from "../../lib/session";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.query;
  if (!code) return res.redirect("/?error=no_code");

  try {
    // 1. Exchange code for tokens
    const tokens = await exchangeCode(code);

    // 2. Get Discord user info
    const discordUser = await getDiscordUser(tokens.access_token);

    // 3. Check for LIVEFAST ACO role
    const hasRole = await checkUserRole(discordUser.id);
    if (!hasRole) {
      return res.redirect("/?error=no_role");
    }

    // 4. Upsert user in Supabase
    let supabaseUser = null;
    try {
      const sb = getServiceSupabase();
      const { data, error } = await sb
        .from("users")
        .upsert(
          {
            discord_id: discordUser.id,
            discord_username: discordUser.username,
            discord_avatar: discordUser.avatar,
            email: discordUser.email,
            discord_access_token: tokens.access_token,
            discord_refresh_token: tokens.refresh_token,
            last_login: new Date().toISOString(),
          },
          { onConflict: "discord_id" }
        )
        .select()
        .single();

      if (error) throw error;
      supabaseUser = data;
    } catch (dbErr) {
      console.error("Supabase upsert error:", dbErr);
      // Continue without DB -- user can still access with session
    }

    // 5. Create session cookie
    setSessionCookie(res, {
      userId: supabaseUser?.id || discordUser.id,
      discordId: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar,
      email: discordUser.email,
      isAdmin: false, // Set via admin panel later
    });

    // 6. Redirect to dashboard
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Auth callback error:", err);
    return res.redirect("/?error=auth_failed");
  }
}
