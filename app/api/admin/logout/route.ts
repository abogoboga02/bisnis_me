import { clearAdminSessionCookie } from "@/lib/admin-session";
import { assertRateLimit, assertSameOrigin, jsonResponse } from "@/lib/route-security";

export async function POST(request: Request) {
  assertSameOrigin(request);
  assertRateLimit(request, {
    namespace: "admin-logout",
    max: 20,
    windowMs: 10 * 60 * 1000,
  });

  const response = jsonResponse({ ok: true }, { noStore: true });
  clearAdminSessionCookie(response);
  return response;
}
