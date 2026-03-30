import { listBusinessesFromDatabase } from "@/lib/business-store";
import { handleRouteError, jsonResponse } from "@/lib/route-security";

export async function GET() {
  try {
    const businesses = await listBusinessesFromDatabase();
    return jsonResponse(
      { data: businesses },
      { cacheControl: "public, max-age=60, s-maxage=60, stale-while-revalidate=300" },
    );
  } catch (error) {
    return handleRouteError(error, "Failed to fetch businesses.");
  }
}
