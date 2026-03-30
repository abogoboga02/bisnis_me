import { createManagedUserRecord, listManagedUsersFromDatabase } from "@/lib/business-store";
import {
  assertJsonRequest,
  assertRateLimit,
  assertSameOrigin,
  handleRouteError,
  jsonResponse,
  requireAdminApiSession,
} from "@/lib/route-security";

export async function GET() {
  try {
    const session = await requireAdminApiSession();
    const users = await listManagedUsersFromDatabase(session);
    return jsonResponse({ data: users }, { noStore: true });
  } catch (error) {
    return handleRouteError(error, "Gagal memuat data user.");
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    assertRateLimit(request, {
      namespace: "admin-users-write",
      max: 10,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requireAdminApiSession();
    const body = await request.json();
    const user = await createManagedUserRecord(body, session);
    return jsonResponse({ data: user }, { noStore: true });
  } catch (error) {
    return handleRouteError(error, "Gagal membuat user baru.");
  }
}
