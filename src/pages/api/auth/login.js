import { getDiscordAuthUrl } from "../../lib/discord";

export default function handler(req, res) {
  res.redirect(getDiscordAuthUrl());
}
