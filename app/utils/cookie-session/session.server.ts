import { createCookieSessionStorage, redirect } from "react-router";

const authSession = createCookieSessionStorage({
  cookie: {
    name: "auth_session",
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: true,
    secrets: [process.env.SESSION_SECRET as string],
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});

// Get the user id from the session
export async function getUserId(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await authSession.getSession(cookie);
  const userId = session.get("userId");
  return userId;
}

// Create a login session
export async function createLoginSession(userId: any, redirectTO: any) {
  // Get a empty session
  const session = await authSession.getSession();
  session.set("userId", userId);
  return redirect(redirectTO, {
    headers: {
      "Set-Cookie": await authSession.commitSession(session),
    },
  });
}

// Destroy the session and logout
export async function logout(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await authSession.getSession(cookie);

  return redirect("/", {
    headers: {
      "Set-Cookie": await authSession.destroySession(session),
    },
  });
}
