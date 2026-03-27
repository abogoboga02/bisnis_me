import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/admin-session";
import { getApiUrl, getInternalApiKey } from "@/lib/internal-api";

const API_URL = getApiUrl();

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": getInternalApiKey(),
      },
      body,
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      data?: { admin: { id: number; email: string; name: string } };
      error?: string;
    };

    if (!response.ok || !payload.data?.admin) {
      return NextResponse.json(
        { error: payload.error || "Login admin gagal." },
        { status: response.status || 500 },
      );
    }

    const nextResponse = NextResponse.json({ data: { admin: payload.data.admin } });
    setAdminSessionCookie(nextResponse, payload.data.admin);
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : `Backend API is unavailable at ${API_URL}.` },
      { status: 502 },
    );
  }
}
