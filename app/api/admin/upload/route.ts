import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

function shouldUseSupabaseStorage() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

function getBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "business-assets";
}

async function ensureBucket() {
  const bucketName = getBucketName();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return bucketName;
  }

  const supabase = getSupabaseAdmin();
  const bucketResult = await supabase.storage.getBucket(bucketName);

  if (!bucketResult.error) {
    return bucketName;
  }

  const createResult = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: `${MAX_FILE_SIZE}`,
  });

  if (createResult.error && !createResult.error.message.toLowerCase().includes("already")) {
    throw new Error(createResult.error.message);
  }

  return bucketName;
}

async function uploadToSupabaseStorage(file: File) {
  const supabase = getSupabaseAdmin();
  const bucketName = await ensureBucket();
  const extension = getExtension(file);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const storagePath = `businesses/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucketName).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
  return {
    path: data.publicUrl,
    fileName,
  };
}

async function uploadToLocalDisk(file: File) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "businesses");
  await fs.mkdir(uploadDir, { recursive: true });

  const extension = getExtension(file);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const absolutePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  return {
    path: `/uploads/businesses/${fileName}`,
    fileName,
  };
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

    const uploaded = shouldUseSupabaseStorage()
      ? await uploadToSupabaseStorage(file)
      : await uploadToLocalDisk(file);

    return NextResponse.json({ data: uploaded });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload gambar gagal." },
      { status: 500 },
    );
  }
}
