import type { Route } from "./+types/api.summarize";
import { getUserId } from "~/server/cookie-session/session.server";
import { getUserResourceById } from "~/server/prisma/dashboard-prisma.server";
import {
  isSummarizable,
  summarizeResource,
} from "~/server/ai/summarize.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const resourceId = formData.get("resourceId") as string | null;

    if (!resourceId) {
      return Response.json(
        { ok: false, error: "Resource ID is required." },
        { status: 400 }
      );
    }

    // Verify user owns the resource
    const resource = await getUserResourceById(Number(resourceId), userId);
    if (!resource) {
      return Response.json(
        {
          ok: false,
          error: "Resource not found or you do not have permission.",
        },
        { status: 404 }
      );
    }

    // Check if file type is summarizable
    if (!isSummarizable(resource.file_path)) {
      return Response.json(
        { ok: false, error: "Only PDF and DOCX files can be summarized." },
        { status: 400 }
      );
    }

    // Summarize the resource
    const summary = await summarizeResource(resource.file_path);

    return Response.json(
      { ok: true, summary },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Summarize] Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to summarize. Please try again.";
    return Response.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
