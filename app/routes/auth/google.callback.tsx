import { redirect } from "react-router";
import type { Route } from "./+types/google.callback";

import { getGoogleTokens, getGoogleUserInfo } from "~/utils/google-auth/google-auth.server";
import { createLoginSession } from "~/utils/cookie-session/session.server";
import prisma from "~/utils/prisma.server";

/** Handle GoogleOAuth callback: exchange code → upsert user → create session. */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // User denied consent or something went wrong on Google's side
  if (error || !code) {
    return redirect(`/login?error=${encodeURIComponent(error || "missing_code")}`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokens = await getGoogleTokens(code);

    // 2. Fetch user profile from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.verified_email) {
      return redirect("/login?error=unverified_email");
    }

    // 3. Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.id },
          { email: googleUser.email },
        ],
      },
    });

    if (user) {
      // Link Google account if not already linked & update profile picture
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            profileImg: googleUser.picture,
          },
        });
      }
    } else {
      // Create a new user (no password — Google-only account)
      user = await prisma.user.create({
        data: {
          user_name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.id,
          profileImg: googleUser.picture,
        },
      });
    }

    // 4. Create session
    return await createLoginSession(user.id, "/user/dashboard");
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return redirect("/login?error=oauth_failed");
  }
}
