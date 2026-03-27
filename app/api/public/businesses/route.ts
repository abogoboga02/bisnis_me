import { NextResponse } from "next/server";
import { listBusinessesFromDatabase } from "@/lib/business-store";

export async function GET() {
  try {
    const businesses = await listBusinessesFromDatabase();
    return NextResponse.json({ data: businesses });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch businesses." },
      { status: 500 },
    );
  }
}
