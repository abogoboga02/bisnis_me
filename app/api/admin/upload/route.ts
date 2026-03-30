import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import {
  ADMIN_UPLOAD_ALLOWED_TYPES,
  ADMIN_UPLOAD_HELPER_TEXT,
  ADMIN_UPLOAD_MAX_FILE_SIZE,
} from "@/lib/admin-upload";
import {
  assertRateLimit,
  assertSameOrigin,
  createRouteError,
  handleRouteError,
  jsonResponse,
  requireAdminApiSession,
} from "@/lib/route-security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
    default:
      return "";
  }
}

function detectMimeFromBuffer(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }

  return null;
}

async function validateImageFile(file: File) {
  if (!ADMIN_UPLOAD_ALLOWED_TYPES.has(file.type)) {
    throw createRouteError(400, "Format gambar wajib JPG, PNG, atau WEBP.");
  }

  if (file.size > ADMIN_UPLOAD_MAX_FILE_SIZE) {
    throw createRouteError(400, "Ukuran gambar maksimal 2 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectMimeFromBuffer(buffer);

  if (!detectedMime || detectedMime !== file.type) {
    throw createRouteError(400, "File gambar tidak valid atau terdeteksi sebagai file berbahaya.");
  }

  return buffer;
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
    fileSizeLimit: `${ADMIN_UPLOAD_MAX_FILE_SIZE}`,
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
  const buffer = await validateImageFile(file);

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
  const buffer = await validateImageFile(file);
  await fs.writeFile(absolutePath, buffer);

  return {
    path: `/uploads/businesses/${fileName}`,
    fileName,
  };
}

export async function POST(request: Request) {
  try {
    await requireAdminApiSession();
    assertSameOrigin(request);
    assertRateLimit(request, {
      namespace: "admin-upload",
      max: 20,
      windowMs: 10 * 60 * 1000,
    });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw createRouteError(400, "File gambar wajib dikirim.");
    }

    const uploaded = shouldUseSupabaseStorage()
      ? await uploadToSupabaseStorage(file)
      : await uploadToLocalDisk(file);

    return jsonResponse({ data: uploaded }, { noStore: true });
  } catch (error) {
    const fallback = `Upload gambar gagal. ${ADMIN_UPLOAD_HELPER_TEXT}`;
    return handleRouteError(error, fallback);
  }
}
