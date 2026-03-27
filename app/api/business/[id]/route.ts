import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getApiUrl, getInternalApiKey } from "@/lib/internal-api";

const API_URL = getApiUrl();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.text();
    const response = await fetch(`${API_URL}/api/business/${id}`, {
      method: "PUT",
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

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const response = await fetch(`${API_URL}/api/business/${id}`, {
      method: "DELETE",
      headers: {
        "x-internal-api-key": getInternalApiKey(),
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

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
