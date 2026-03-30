import { createBusinessRecord } from "@/lib/business-store";
import {
  assertJsonRequest,
  assertRateLimit,
  assertSameOrigin,
  handleRouteError,
  jsonResponse,
  requireAdminApiSession,
} from "@/lib/route-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    assertRateLimit(request, {
      namespace: "business-create",
      max: 20,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requireAdminApiSession();
    const body = await request.json();
    const business = await createBusinessRecord(body, session);
    return jsonResponse({ data: business }, { noStore: true });
  } catch (error) {
    return handleRouteError(error, "Gagal membuat bisnis.");
  }
}
