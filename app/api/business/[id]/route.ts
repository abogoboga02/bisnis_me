import { deleteBusinessRecord, updateBusinessRecord } from "@/lib/business-store";
import {
  assertJsonRequest,
  assertRateLimit,
  assertSameOrigin,
  createRouteError,
  handleRouteError,
  jsonResponse,
  requireAdminApiSession,
} from "@/lib/route-security";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    assertRateLimit(request, {
      namespace: "business-update",
      max: 40,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requireAdminApiSession();
    const { id } = await context.params;
    const businessId = Number(id);
    if (!Number.isInteger(businessId) || businessId <= 0) {
      throw createRouteError(400, "Business ID tidak valid.");
    }

    const business = await updateBusinessRecord(businessId, await request.json(), session);

    if (!business) {
      throw createRouteError(404, "Business not found.");
    }

    return jsonResponse({ data: business }, { noStore: true });
  } catch (error) {
    return handleRouteError(error, "Gagal memperbarui bisnis.");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    assertRateLimit(request, {
      namespace: "business-delete",
      max: 10,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requireAdminApiSession();
    const { id } = await context.params;
    const businessId = Number(id);
    if (!Number.isInteger(businessId) || businessId <= 0) {
      throw createRouteError(400, "Business ID tidak valid.");
    }

    const deleted = await deleteBusinessRecord(businessId, session);

    if (!deleted) {
      throw createRouteError(404, "Business not found.");
    }

    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  } catch (error) {
    return handleRouteError(error, "Gagal menghapus bisnis.");
  }
}
