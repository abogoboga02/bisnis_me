import { NextResponse } from "next/server";
import { deleteBusinessRecord, updateBusinessRecord } from "@/lib/business-store";
import { getAdminSession } from "@/lib/admin-session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AppError = Error & { status?: number };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const businessId = Number(id);
    if (!Number.isInteger(businessId) || businessId <= 0) {
      return NextResponse.json({ error: "Business ID tidak valid." }, { status: 400 });
    }

    const business = await updateBusinessRecord(businessId, await request.json());

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    return NextResponse.json({ data: business });
  } catch (error) {
    const appError = error as AppError;
    return NextResponse.json(
      { error: appError.message || "Gagal memperbarui bisnis." },
      { status: appError.status ?? 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const businessId = Number(id);
    if (!Number.isInteger(businessId) || businessId <= 0) {
      return NextResponse.json({ error: "Business ID tidak valid." }, { status: 400 });
    }

    const deleted = await deleteBusinessRecord(businessId);

    if (!deleted) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const appError = error as AppError;
    return NextResponse.json(
      { error: appError.message || "Gagal menghapus bisnis." },
      { status: appError.status ?? 500 },
    );
  }
}
