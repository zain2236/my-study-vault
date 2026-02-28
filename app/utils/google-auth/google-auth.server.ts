/**
 * Google OAuth 2.0 utilities — zero external dependencies.
 * Uses Google's REST endpoints directly with fetch().
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function getRedirectURI(): string {
  const base = process.env.APP_URL || "http://localhost:5173";
  return `${base}/auth/google/callback`;
}

/** Build the Google OAuth consent screen URL. */
export function getGoogleAuthURL(): string {
  const params = new URLSearchParams({
    client_id: getEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: getRedirectURI(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Exchange an authorization code for access + id tokens. */
export async function getGoogleTokens(code: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getEnv("GOOGLE_CLIENT_ID"),
      client_secret: getEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: getRedirectURI(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    id_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  }>;
}

/** Fetch the authenticated user's Google profile. */
export async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return res.json() as Promise<{
    id: string; // Google subject ID
    email: string;
    name: string;
    picture: string;
    verified_email: boolean;
  }>;
}
