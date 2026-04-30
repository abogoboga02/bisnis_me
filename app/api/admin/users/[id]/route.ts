import { deleteManagedUserRecord, updateManagedUserRecord } from "@/lib/business-store";
import {
  assertJsonRequest,
  assertRateLimit,
  assertSameOrigin,
  createRouteError,
  handleRouteError,
  jsonResponse,
  requireAdminApiSession,
} from "@/lib/route-security";

function parseUserId(value: string) {
  const userId = Number(value);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createRouteError(400, "User ID tidak valid.");
  }

  return userId;
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    assertRateLimit(request, {
      namespace: "admin-users-update",
      max: 20,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requireAdminApiSession();
    const { id } = await context.params;
    const userId = parseUserId(id);
    const body = await request.json();
    const user = await updateManagedUserRecord(userId, body, session);
    return jsonResponse({ data: user }, { noStore: true });
  } catch (error) {
    return handleRouteError(error, "Gagal memperbarui user.");
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    assertRateLimit(request, {
      namespace: "admin-users-delete",
      max: 10,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requireAdminApiSession();
    const { id } = await context.params;
    const userId = parseUserId(id);
    await deleteManagedUserRecord(userId, session);
    return jsonResponse({ data: { success: true } }, { status: 200, noStore: true });
  } catch (error) {
    return handleRouteError(error, "Gagal menghapus user.");
  }
}
