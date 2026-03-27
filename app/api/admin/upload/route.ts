import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

function getExtension(file: File) {
  const originalName = file.name || "upload";
  const extension = path.extname(originalName).toLowerCase();
  if (extension) {
    return extension;
  }

  switch (file.type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    default:
      return "";
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File gambar wajib dikirim." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Format gambar tidak didukung." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "businesses");
    await fs.mkdir(uploadDir, { recursive: true });

    const extension = getExtension(file);
    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const absolutePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);

    return NextResponse.json({
      data: {
        path: `/uploads/businesses/${fileName}`,
        fileName,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload gambar gagal." },
      { status: 500 },
    );
  }
}
