import { setAdminSessionCookie } from "@/lib/admin-session";
import { authenticateAdmin } from "@/lib/business-store";
import {
  assertJsonRequest,
  assertRateLimit,
  assertSameOrigin,
  handleRouteError,
  jsonResponse,
} from "@/lib/route-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    assertRateLimit(request, {
      namespace: "admin-login",
      max: 5,
      windowMs: 10 * 60 * 1000,
    });

    const body = (await request.json()) as { email?: string; password?: string };
    const admin = await authenticateAdmin(body.email, body.password);

    const nextResponse = jsonResponse({ data: { admin } }, { noStore: true });
    setAdminSessionCookie(nextResponse, admin);
    return nextResponse;
  } catch (error) {
    return handleRouteError(error, "Login admin gagal.");
  }
}
