import { getCachedPublicTemplates } from "@/lib/business-store";
import { handleRouteError, jsonResponse } from "@/lib/route-security";

export async function GET() {
  try {
    const templates = await getCachedPublicTemplates();
    return jsonResponse(
      { data: templates },
      { cacheControl: "public, max-age=60, s-maxage=60, stale-while-revalidate=300" },
    );
  } catch (error) {
    return handleRouteError(error, "Failed to fetch templates.");
  }
}
