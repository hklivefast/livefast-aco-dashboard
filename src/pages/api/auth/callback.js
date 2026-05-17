import { exchangeCode, getUser, getGuildMember, hasRequiredRole } from "@/lib/discord";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect("/?error=access_denied");
  }

  try {
    // Exchange authorization code for access token
    const tokenData = await exchangeCode(code);
    const accessToken = tokenData.access_token;

    // Get user info
    const user = await getUser(accessToken);

    // Check guild membership and role
    const member = await getGuildMember(accessToken);

    if (!member) {
      return res.redirect("/?error=not_in_server");
    }

    if (!hasRequiredRole(member)) {
      return res.redirect("/?error=missing_role");
    }

    // Create session
    const sessionToken = await createSessionToken({
      id: user.id,
      username: user.username || user.global_name,
      avatar: user.avatar,
    });

    setSessionCookie(res, sessionToken);
    return res.redirect("/");
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.redirect("/?error=auth_failed");
  }
}
