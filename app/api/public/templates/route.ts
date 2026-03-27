import { NextResponse } from "next/server";
import { listTemplatesFromDatabase } from "@/lib/business-store";

export async function GET() {
  try {
    const templates = await listTemplatesFromDatabase();
    return NextResponse.json({ data: templates });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch templates." },
      { status: 500 },
    );
  }
}
