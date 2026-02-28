import { redirect } from "react-router";
import { getGoogleAuthURL } from "~/utils/google-auth/google-auth.server";
import { getUserId } from "~/utils/cookie-session/session.server";
import type { Route } from "./+types/google";

/** Redirect authenticated users; otherwise send to Google consent screen. */
export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/user/dashboard");

  return redirect(getGoogleAuthURL());
}
