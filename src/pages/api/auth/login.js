import { getAuthUrl } from "@/lib/discord";

export default function handler(req, res) {
  res.redirect(302, getAuthUrl());
}
