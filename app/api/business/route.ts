import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getApiUrl, getInternalApiKey } from "@/lib/internal-api";

const API_URL = getApiUrl();

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.text();
    const response = await fetch(`${API_URL}/api/business`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": getInternalApiKey(),
      },
      body,
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : `Backend API is unavailable at ${API_URL}.` },
      { status: 502 },
    );
  }
}
