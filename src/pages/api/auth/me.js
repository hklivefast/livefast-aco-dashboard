import { getSession } from "../../lib/session";

export default function handler(req, res) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    user: {
      userId: session.userId,
      discordId: session.discordId,
      username: session.username,
      avatar: session.avatar,
      email: session.email,
      isAdmin: session.isAdmin,
    },
  });
}
