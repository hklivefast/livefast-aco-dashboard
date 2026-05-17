import { serialize, parse } from "cookie";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const SESSION_NAME = "lf_session";

// Simple encrypted session stored in HTTP-only cookie
export function createSessionToken(data) {
  const payload = JSON.stringify({
    ...data,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(SESSION_SECRET, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function parseSessionToken(token) {
  try {
    const [ivHex, encrypted] = token.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(SESSION_SECRET, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const data = JSON.parse(decrypted);
    if (data.exp < Date.now()) return null; // Expired
    return data;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, data) {
  const token = createSessionToken(data);
  res.setHeader(
    "Set-Cookie",
    serialize(SESSION_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
  );
}

export function getSession(req) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies[SESSION_NAME];
  if (!token) return null;
  return parseSessionToken(token);
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    serialize(SESSION_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
}
