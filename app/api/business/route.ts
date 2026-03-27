import { NextResponse } from "next/server";
import { createBusinessRecord } from "@/lib/business-store";
import { getAdminSession } from "@/lib/admin-session";

type AppError = Error & { status?: number };

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const business = await createBusinessRecord(body, session);
    return NextResponse.json({ data: business });
  } catch (error) {
    const appError = error as AppError;
    return NextResponse.json(
      { error: appError.message || "Gagal membuat bisnis." },
      { status: appError.status ?? 500 },
    );
  }
}
