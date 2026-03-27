import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/admin-session";
import { authenticateAdmin } from "@/lib/business-store";

type AppError = Error & { status?: number };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const admin = await authenticateAdmin(body.email, body.password);

    const nextResponse = NextResponse.json({ data: { admin } });
    setAdminSessionCookie(nextResponse, admin);
    return nextResponse;
  } catch (error) {
    const appError = error as AppError;
    return NextResponse.json(
      { error: appError.message || "Login admin gagal." },
      { status: appError.status ?? 500 },
    );
  }
}
