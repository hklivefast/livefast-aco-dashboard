import { getSessionCookie, verifySession } from "@/lib/session";

export default async function handler(req, res) {
  const token = getSessionCookie(req);

  if (!token) {
    return res.json({ user: null });
  }

  const session = await verifySession(token);

  if (!session) {
    return res.json({ user: null });
  }

  return res.json({
    user: {
      id: session.id,
      username: session.username,
      avatar: session.avatar,
      verified: session.verified,
    },
  });
}
