import "server-only";

import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import Replicate from "replicate";
import {
  AI_CONTACT_DEFAULTS,
  AI_SECTION_TARGET_META,
  buildFallbackReviewNotes,
  type AiBusinessContent,
  type AiBusinessSectionResult,
  type AiBusinessSectionTarget,
  type AiBusinessTemplateContext,
} from "@/lib/ai-business-content";
import { iconOptions } from "@/lib/icon-map";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getTemplateFormConfig } from "@/lib/template-form-config";
import type { Business } from "@/lib/types";

type GenerateBusinessContentInput = {
  brief: string;
  template: AiBusinessTemplateContext;
  currentDraft?: Partial<Business>;
};

type GenerateSectionInput = {
  brief: string;
  target: AiBusinessSectionTarget;
  template: AiBusinessTemplateContext;
  currentDraft: Partial<Business>;
};

type PersistedImage = {
  path: string;
};

type VisualAssetSet = {
  heroImage: string | null;
  galleryImageUrls: Array<string | null>;
  reviewNotes: string[];
};

type TextProvider = "anthropic" | "openai-compatible";

type AnthropicMessageResponse = {
  content?: Array<{ type?: string; text?: string }>;
  error?: { message?: string; type?: string };
};

type KieCreateTaskResponse = {
  code?: number;
  msg?: string;
  data?: {
    taskId?: string;
  } | null;
};

type KieTaskDetailResponse = {
  code?: number;
  msg?: string;
  data?: {
    state?: string;
    resultJson?: string;
    failMsg?: string;
  } | null;
};

type GeneratedImageFormat = "png" | "jpeg" | "webp";
type KieAspectRatio = "1:1" | "16:9";
type KieResolution = "1K" | "2K";

type ImageProviderConfig =
  | {
      provider: "replicate";
      client: Replicate;
      model: string;
    }
  | {
      provider: "kie";
      apiKey: string;
      baseURL: string;
      model: string;
    }
  | {
      provider: "openai-compatible";
      client: OpenAI;
      model: string;
    };

let cachedOpenAiCompatibleClient: OpenAI | null = null;
let cachedImageClient: OpenAI | null = null;
let cachedReplicateClient: Replicate | null = null;
const KIE_POLL_INTERVAL_MS = 3_000;
const KIE_POLL_TIMEOUT_MS = 5 * 60 * 1_000;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getTextProvider(): TextProvider {
  return cleanText(process.env.ANTHROPIC_API_KEY) ? "anthropic" : "openai-compatible";
}

function getAnthropicApiKey() {
  const apiKey = cleanText(process.env.ANTHROPIC_API_KEY);

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY belum diisi. Tambahkan dulu ke env lokal server.");
  }

  return apiKey;
}

function getAnthropicModel() {
  return cleanText(process.env.ANTHROPIC_MODEL) || "claude-haiku-4-5";
}

function getAnthropicMessagesUrl() {
  return cleanText(process.env.ANTHROPIC_API_BASE_URL) || "https://api.anthropic.com/v1/messages";
}

function getOpenAICompatibleTextClient() {
  if (cachedOpenAiCompatibleClient) {
    return cachedOpenAiCompatibleClient;
  }

  const apiKey = cleanText(process.env.SUMOPOD_API_KEY);
  const baseURL = cleanText(process.env.SUMOPOD_BASE_URL) || "https://ai.sumopod.com/v1";

  if (!apiKey) {
    throw new Error(
      "Provider text AI belum dikonfigurasi. Isi ANTHROPIC_API_KEY untuk Claude atau SUMOPOD_API_KEY untuk provider OpenAI-compatible.",
    );
  }

  cachedOpenAiCompatibleClient = new OpenAI({
    apiKey,
    baseURL,
  });

  return cachedOpenAiCompatibleClient;
}

function getOpenAICompatibleTextModel() {
  return cleanText(process.env.SUMOPOD_MODEL) || "qwen3.6-flash";
}

function getKieApiBaseUrl() {
  return (cleanText(process.env.KIE_API_BASE_URL) || "https://api.kie.ai").replace(/\/+$/, "");
}

function getKieImageModel() {
  return cleanText(process.env.KIE_IMAGE_MODEL) || "gpt-image-2-text-to-image";
}

function getImageProviderConfig() {
  const kieApiKey = cleanText(process.env.KIE_API_KEY);

  if (kieApiKey) {
    return {
      provider: "kie" as const,
      apiKey: kieApiKey,
      baseURL: getKieApiBaseUrl(),
      model: getKieImageModel(),
    };
  }

  const replicateToken = cleanText(process.env.REPLICATE_API_TOKEN);
  const replicateModel = cleanText(process.env.REPLICATE_IMAGE_MODEL) || cleanText(process.env.IMAGE_MODEL);

  if (replicateToken && replicateModel) {
    if (!cachedReplicateClient) {
      cachedReplicateClient = new Replicate({
        auth: replicateToken,
      });
    }

    return {
      provider: "replicate" as const,
      client: cachedReplicateClient,
      model: replicateModel,
    };
  }

  const apiKey = cleanText(process.env.IMAGE_API_KEY) || cleanText(process.env.SUMOPOD_API_KEY);
  const baseURL = cleanText(process.env.IMAGE_API_BASE_URL) || cleanText(process.env.SUMOPOD_BASE_URL) || "https://ai.sumopod.com/v1";
  const model = cleanText(process.env.IMAGE_MODEL) || cleanText(process.env.SUMOPOD_IMAGE_MODEL);

  if (!apiKey || !model) {
    return null;
  }

  if (!cachedImageClient) {
    cachedImageClient = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  return {
    provider: "openai-compatible" as const,
    client: cachedImageClient,
    model,
  };
}

function extractJsonObject(content: string) {
  const fenced =
    content.match(/```json\s*([\s\S]*?)```/i)?.[1] ??
    content.match(/```([\s\S]*?)```/i)?.[1] ??
    content;

  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model tidak mengembalikan JSON yang bisa diproses.");
  }

  return JSON.parse(fenced.slice(start, end + 1)) as Record<string, unknown>;
}

function pickText(value: unknown, fallback: string) {
  return cleanText(value) || fallback;
}

function normalizeList<T>(value: unknown) {
  return Array.isArray(value) ? value : ([] as T[]);
}

function normalizeReviewNotes(value: unknown) {
  return normalizeList<unknown>(value)
    .map((note) => cleanText(note))
    .filter(Boolean)
    .slice(0, 6);
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
    fileSizeLimit: "4194304",
  });

  if (createResult.error && !createResult.error.message.toLowerCase().includes("already")) {
    throw new Error(createResult.error.message);
  }

  return bucketName;
}

function getExtensionFromFormat(format: GeneratedImageFormat) {
  switch (format) {
    case "jpeg":
      return ".jpg";
    case "webp":
      return ".webp";
    default:
      return ".png";
  }
}

function getMimeFromFormat(format: GeneratedImageFormat) {
  switch (format) {
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

async function persistGeneratedImage(buffer: Buffer, format: GeneratedImageFormat): Promise<PersistedImage> {
  const extension = getExtensionFromFormat(format);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

  if (shouldUseSupabaseStorage()) {
    const supabase = getSupabaseAdmin();
    const bucketName = await ensureBucket();
    const storagePath = `businesses/${fileName}`;
    const { error } = await supabase.storage.from(bucketName).upload(storagePath, buffer, {
      contentType: getMimeFromFormat(format),
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    return { path: data.publicUrl };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "businesses");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);
  return { path: `/uploads/businesses/${fileName}` };
}

function detectImageFormat(buffer: Buffer, fallback: GeneratedImageFormat = "jpeg"): GeneratedImageFormat {
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return fallback;
}

function summarizeCurrentDraft(draft?: Partial<Business>) {
  if (!draft) {
    return "Belum ada draft sebelumnya.";
  }

  const services = (draft.services ?? [])
    .map((item, index) => {
      const name = item.name?.trim();
      const description = item.description?.trim();

      if (!name && !description) {
        return "";
      }

      return `- Layanan ${index + 1}: ${name || "(tanpa nama)"} | ${description || "(tanpa deskripsi)"}`;
    })
    .filter(Boolean)
    .join("\n");

  return [
    `Nama: ${draft.name?.trim() || "-"}`,
    `Tagline: ${draft.tagline?.trim() || "-"}`,
    `Deskripsi: ${draft.description?.trim() || "-"}`,
    `Telepon: ${draft.phone?.trim() || "-"}`,
    `WhatsApp: ${draft.whatsapp?.trim() || "-"}`,
    `Alamat: ${draft.address?.trim() || "-"}`,
    services ? `Layanan saat ini:\n${services}` : "Layanan saat ini: -",
  ].join("\n");
}

function buildFallbackHeroPrompt(input: GenerateBusinessContentInput, businessName: string, description: string) {
  return [
    "Create a premium landing page hero image for a business website.",
    `Business name: ${businessName}.`,
    `Business context: ${description}.`,
    `Design direction: align with the template "${input.template.name}" (${input.template.description}).`,
    `Category: ${input.template.categoryLabel || input.template.category}.`,
    "No text, no logo watermark, no phone number, no UI mockup, no collage.",
    "Focus on a clean marketing visual that feels believable, polished, and relevant to the business brief.",
  ].join(" ");
}

function buildFallbackGalleryPrompt(
  input: GenerateBusinessContentInput,
  businessName: string,
  itemTitle: string,
  itemCaption: string,
) {
  return [
    "Create a supporting gallery image for a business landing page.",
    `Business name: ${businessName}.`,
    `Visual subject: ${itemTitle}.`,
    `Context: ${itemCaption}.`,
    `Style direction: match the "${input.template.name}" template with ${input.template.feature}.`,
    "No text overlay, no logo watermark, no contact information.",
    "Make the image suitable for a website gallery and clearly connected to the described service or atmosphere.",
  ].join(" ");
}

function normalizeBusinessContent(
  raw: Record<string, unknown>,
  input: GenerateBusinessContentInput,
): AiBusinessContent {
  const templateConfig = getTemplateFormConfig(input.template.key);
  const serviceCount = templateConfig?.serviceSlotCount ?? Math.max(input.currentDraft?.services?.length ?? 0, 3);
  const testimonialCount =
    templateConfig?.fixedTestimonialCount ?? Math.max(input.currentDraft?.testimonials?.length ?? 0, 3);
  const galleryCount = templateConfig?.fixedGalleryCount ?? Math.max(input.currentDraft?.galleryItems?.length ?? 0, 4);
  const iconKeys = iconOptions.map((option) => option.key);
  const servicesRaw = normalizeList<Record<string, unknown>>(raw.services);
  const testimonialsRaw = normalizeList<Record<string, unknown>>(raw.testimonials);
  const galleryRaw = normalizeList<Record<string, unknown>>(raw.galleryItems);
  const draft = input.currentDraft;
  const businessName = pickText(raw.businessName, draft?.name?.trim() || "");
  const description = pickText(
    raw.description,
    draft?.description?.trim() ||
      `${businessName || "Bisnis ini"} menampilkan layanan utama, nilai bisnis, dan ajakan kontak yang jelas untuk calon pelanggan.`,
  );

  return {
    businessName,
    tagline: pickText(
      raw.tagline,
      draft?.tagline?.trim() || `${businessName || "Bisnis ini"} hadir dengan presentasi yang rapi dan meyakinkan.`,
    ),
    description,
    heroLabel: pickText(raw.heroLabel, draft?.heroLabel?.trim() || input.template.name),
    heroCtaLabel: pickText(raw.heroCtaLabel, draft?.heroCtaLabel?.trim() || "Konsultasi Sekarang"),
    heroCtaUrl: pickText(raw.heroCtaUrl, draft?.heroCtaUrl?.trim() || "#contact"),
    aboutIntro: pickText(
      raw.aboutIntro,
      draft?.aboutIntro?.trim() ||
        `${businessName || "Brand ini"} dirancang sebagai bisnis yang profesional, mudah dipercaya, dan nyaman dipilih calon pelanggan.`,
    ),
    servicesIntro: pickText(
      raw.servicesIntro,
      draft?.servicesIntro?.trim() ||
        `Susun layanan ${businessName || "bisnis ini"} agar pengunjung cepat memahami manfaat utama dan hasil yang ditawarkan.`,
    ),
    testimonialsIntro: pickText(
      raw.testimonialsIntro,
      draft?.testimonialsIntro?.trim() ||
        "Gunakan testimoni draft ini sebagai fondasi awal, lalu ganti dengan testimoni pelanggan asli sebelum dipublikasikan.",
    ),
    galleryIntro: pickText(
      raw.galleryIntro,
      draft?.galleryIntro?.trim() ||
        "Setiap frame galeri sebaiknya menampilkan hasil kerja, suasana bisnis, atau bukti visual yang memperkuat kepercayaan.",
    ),
    contactIntro: pickText(
      raw.contactIntro,
      draft?.contactIntro?.trim() ||
        `Ajak pengunjung menghubungi ${businessName || "bisnis ini"} lewat WhatsApp, telepon, atau alamat yang tersedia.`,
    ),
    boardmemoLabel: pickText(raw.boardmemoLabel, draft?.boardmemoLabel?.trim() || "AI Draft Note"),
    boardmemoTitle: pickText(
      raw.boardmemoTitle,
      draft?.boardmemoTitle?.trim() || "Draft awal yang siap dirapikan sebelum dipublikasikan.",
    ),
    boardmemoBody: pickText(
      raw.boardmemoBody,
      draft?.boardmemoBody?.trim() ||
        "Konten ini dibuat otomatis sebagai fondasi awal. Tim Anda tetap perlu meninjau akurasi layanan, kontak, dan materi visual.",
    ),
    phone: pickText(raw.phone, draft?.phone?.trim() || AI_CONTACT_DEFAULTS.phone),
    whatsapp: pickText(raw.whatsapp, draft?.whatsapp?.trim() || AI_CONTACT_DEFAULTS.whatsapp),
    address: pickText(raw.address, draft?.address?.trim() || AI_CONTACT_DEFAULTS.address),
    metaTitle: pickText(raw.metaTitle, draft?.metaTitle?.trim() || `${businessName || "Bisnis"} | Landing Page`),
    metaDescription: pickText(
      raw.metaDescription,
      draft?.metaDescription?.trim() ||
        `${businessName || "Bisnis ini"} menampilkan layanan utama, diferensiasi, dan jalur kontak yang jelas untuk calon pelanggan.`,
    ),
    heroImagePrompt: pickText(raw.heroImagePrompt, buildFallbackHeroPrompt(input, businessName || "Bisnis", description)),
    heroImage: null,
    services: Array.from({ length: serviceCount }, (_, index) => {
      const item = servicesRaw[index] ?? {};
      const fallbackIcon = iconKeys[index % iconKeys.length] ?? "sparkles";
      const existingService = draft?.services?.[index];

      return {
        name: pickText(item.name, existingService?.name?.trim() || `Layanan ${index + 1} ${businessName || "Bisnis"}`),
        description: pickText(
          item.description,
          existingService?.description?.trim() ||
            `Jelaskan manfaat utama layanan ${index + 1} ${businessName || "bisnis ini"} dengan bahasa yang jelas dan fokus pada hasil.`,
        ),
        icon: pickText(item.icon, existingService?.icon?.trim() || fallbackIcon),
      };
    }),
    testimonials: Array.from({ length: testimonialCount }, (_, index) => {
      const item = testimonialsRaw[index] ?? {};
      const existingTestimonial = draft?.testimonials?.[index];

      return {
        name: pickText(item.name, existingTestimonial?.name?.trim() || `Klien ${index + 1}`),
        role: pickText(item.role, existingTestimonial?.role?.trim() || "Pelanggan contoh untuk ditinjau"),
        quote: pickText(
          item.quote,
          existingTestimonial?.quote?.trim() ||
            `Gunakan slot ini untuk memasukkan testimoni pelanggan asli ${businessName || "bisnis ini"} sebelum dipublikasikan.`,
        ),
      };
    }),
    galleryItems: Array.from({ length: galleryCount }, (_, index) => {
      const item = galleryRaw[index] ?? {};
      const existingGallery = draft?.galleryItems?.[index];
      const title = pickText(item.title, existingGallery?.title?.trim() || `Visual ${index + 1} ${businessName || "Bisnis"}`);
      const caption = pickText(
        item.caption,
        existingGallery?.caption?.trim() ||
          `Tambahkan penjelasan singkat tentang visual ${index + 1} agar galeri terasa relevan dan meyakinkan.`,
      );

      return {
        title,
        caption,
        imagePrompt: pickText(item.imagePrompt, buildFallbackGalleryPrompt(input, businessName || "Bisnis", title, caption)),
        imageUrl: existingGallery?.imageUrl || null,
      };
    }),
    reviewNotes: normalizeReviewNotes(raw.reviewNotes),
  };
}

function normalizeSectionResult(
  raw: Record<string, unknown>,
  input: GenerateSectionInput,
): AiBusinessSectionResult {
  if (input.target === "services") {
    const templateConfig = getTemplateFormConfig(input.template.key);
    const serviceCount = templateConfig?.serviceSlotCount ?? Math.max(input.currentDraft.services?.length ?? 0, 3);
    const servicesRaw = normalizeList<Record<string, unknown>>(raw.services);
    const iconKeys = iconOptions.map((option) => option.key);

    return {
      target: input.target,
      services: Array.from({ length: serviceCount }, (_, index) => {
        const item = servicesRaw[index] ?? {};
        const existingService = input.currentDraft.services?.[index];
        return {
          name: pickText(item.name, existingService?.name?.trim() || `Layanan ${index + 1}`),
          description: pickText(
            item.description,
            existingService?.description?.trim() || `Jelaskan manfaat utama layanan ${index + 1} secara singkat dan jelas.`,
          ),
          icon: pickText(item.icon, existingService?.icon?.trim() || iconKeys[index % iconKeys.length] || "sparkles"),
        };
      }),
      reviewNotes: normalizeReviewNotes(raw.reviewNotes),
    };
  }

  return {
    target: input.target,
    text: pickText(raw.text, cleanText(input.currentDraft[input.target]) || ""),
    reviewNotes: normalizeReviewNotes(raw.reviewNotes),
  };
}

function buildFullPrompt(input: GenerateBusinessContentInput) {
  const templateConfig = getTemplateFormConfig(input.template.key);
  const serviceCount = templateConfig?.serviceSlotCount ?? Math.max(input.currentDraft?.services?.length ?? 0, 3);
  const testimonialCount =
    templateConfig?.fixedTestimonialCount ?? Math.max(input.currentDraft?.testimonials?.length ?? 0, 3);
  const galleryCount = templateConfig?.fixedGalleryCount ?? Math.max(input.currentDraft?.galleryItems?.length ?? 0, 4);
  const iconKeys = iconOptions.map((option) => option.key).join(", ");

  const systemPrompt = `
Anda adalah strategist dan copywriter senior untuk landing page bisnis berbahasa Indonesia.
Tugas Anda adalah mengubah satu brief bisnis menjadi draft website yang rapi, relevan, dan siap diedit cepat oleh admin.

Aturan keras:
- Tulis SEMUA output dalam bahasa Indonesia.
- Balas dengan JSON murni, tanpa markdown, tanpa penjelasan tambahan.
- Jangan membuat nomor telepon, WhatsApp, alamat, email, atau URL eksternal palsu. Jika brief tidak menyebutkannya, kembalikan string kosong.
- Jangan membuat klaim fakta spesifik yang tidak bisa diverifikasi.
- Testimoni HARUS diposisikan sebagai draft internal yang aman untuk ditinjau, bukan seolah-olah testimoni pelanggan asli.
- Untuk role testimoni, gunakan label generik profesional seperti "Pemilik brand lokal", "Tim marketing retail", "Manajer operasional", dan sejenisnya.
- Pilih icon layanan hanya dari daftar berikut: ${iconKeys}.
- Buat prompt gambar yang kuat, spesifik, dan relevan dengan brief. Prompt gambar tidak boleh menyertakan teks overlay, watermark, nomor telepon, atau mockup UI.
`.trim();

  const userPrompt = `
Gunakan brief berikut untuk menyusun draft website bisnis:

${input.brief.trim()}

Konteks template:
- Nama template: ${input.template.name}
- Kunci template: ${input.template.key}
- Deskripsi template: ${input.template.description}
- Kategori: ${input.template.categoryLabel || input.template.category}
- Fit: ${input.template.fit}
- Feature: ${input.template.feature}

Draft yang sudah ada dan boleh dipakai sebagai konteks bila brief belum lengkap:
${summarizeCurrentDraft(input.currentDraft)}

Struktur output:
- services harus berisi ${serviceCount} item.
- testimonials harus berisi ${testimonialCount} item.
- galleryItems harus berisi ${galleryCount} item.

Field JSON yang wajib dikembalikan:
{
  "businessName": "string",
  "tagline": "string",
  "description": "string",
  "heroLabel": "string",
  "heroCtaLabel": "string",
  "heroCtaUrl": "#contact",
  "aboutIntro": "string",
  "servicesIntro": "string",
  "testimonialsIntro": "string",
  "galleryIntro": "string",
  "contactIntro": "string",
  "boardmemoLabel": "string",
  "boardmemoTitle": "string",
  "boardmemoBody": "string",
  "phone": "string atau kosong bila brief tidak menyebutkan",
  "whatsapp": "string atau kosong bila brief tidak menyebutkan",
  "address": "string atau kosong bila brief tidak menyebutkan",
  "metaTitle": "string",
  "metaDescription": "string",
  "heroImagePrompt": "string",
  "services": [
    { "name": "string", "description": "string", "icon": "string" }
  ],
  "testimonials": [
    { "name": "string", "role": "string", "quote": "string" }
  ],
  "galleryItems": [
    { "title": "string", "caption": "string", "imagePrompt": "string" }
  ],
  "reviewNotes": ["string", "string"]
}

Pastikan output mengikuti isi brief. Bila brief hanya berisi sebagian informasi, isi sisanya dengan copy aman yang tetap relevan dengan konteks bisnis dan template.
`.trim();

  return { systemPrompt, userPrompt };
}

function buildSectionPrompt(input: GenerateSectionInput) {
  const targetMeta = AI_SECTION_TARGET_META[input.target];
  const iconKeys = iconOptions.map((option) => option.key).join(", ");
  const templateConfig = getTemplateFormConfig(input.template.key);
  const serviceCount = templateConfig?.serviceSlotCount ?? Math.max(input.currentDraft.services?.length ?? 0, 3);

  const systemPrompt = `
Anda adalah copywriter landing page bisnis berbahasa Indonesia.
Tugas Anda adalah membantu admin mengisi SATU bagian konten website berdasarkan brief singkat.

Aturan keras:
- Tulis output dalam bahasa Indonesia.
- Balas dengan JSON murni saja.
- Jangan membuat fakta yang terlalu spesifik jika brief tidak menyebutkannya.
- Jika target adalah services, pilih icon hanya dari daftar berikut: ${iconKeys}.
`.trim();

  const userPrompt = `
Target yang perlu diisi: ${targetMeta.label}
Panduan target: ${targetMeta.guide}

Brief singkat admin:
${input.brief.trim()}

Konteks template:
- Nama template: ${input.template.name}
- Deskripsi: ${input.template.description}
- Feature: ${input.template.feature}

Konteks draft saat ini:
${summarizeCurrentDraft(input.currentDraft)}

${
  input.target === "services"
    ? `Balas dengan JSON:
{
  "services": [
    { "name": "string", "description": "string", "icon": "string" }
  ],
  "reviewNotes": ["string"]
}

Jumlah services wajib ${serviceCount} item.`
    : `Balas dengan JSON:
{
  "text": "string",
  "reviewNotes": ["string"]
}`
}
`.trim();

  return { systemPrompt, userPrompt };
}

async function runAnthropicJsonChat(systemPrompt: string, userPrompt: string) {
  const response = await fetch(getAnthropicMessagesUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": getAnthropicApiKey(),
    },
    body: JSON.stringify({
      model: getAnthropicModel(),
      max_tokens: 2600,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as AnthropicMessageResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || "Anthropic API mengembalikan error.");
  }

  const content = payload.content?.find((item) => item.type === "text")?.text;

  if (!content?.trim()) {
    throw new Error("Claude tidak mengembalikan konten teks yang bisa dipakai.");
  }

  return extractJsonObject(content);
}

async function runOpenAICompatibleJsonChat(systemPrompt: string, userPrompt: string) {
  const client = getOpenAICompatibleTextClient();
  const response = await client.chat.completions.create({
    model: getOpenAICompatibleTextModel(),
    temperature: 0.7,
    max_tokens: 2600,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Model AI tidak mengembalikan konten yang bisa dipakai.");
  }

  return extractJsonObject(content);
}

async function runJsonChat(systemPrompt: string, userPrompt: string) {
  if (getTextProvider() === "anthropic") {
    return runAnthropicJsonChat(systemPrompt, userPrompt);
  }

  return runOpenAICompatibleJsonChat(systemPrompt, userPrompt);
}

async function parseJsonResponse<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getKieImageSettings(size: "1024x1024" | "1536x1024") {
  if (size === "1536x1024") {
    return {
      aspectRatio: "16:9" as KieAspectRatio,
      resolution: "2K" as KieResolution,
    };
  }

  return {
    aspectRatio: "1:1" as KieAspectRatio,
    resolution: "1K" as KieResolution,
  };
}

function buildKieErrorMessage(message: string, fallback: string) {
  const normalized = cleanText(message);
  return normalized ? `Kie API: ${normalized}` : fallback;
}

async function createKieImageTask(
  imageClientConfig: Extract<ImageProviderConfig, { provider: "kie" }>,
  prompt: string,
  size: "1024x1024" | "1536x1024",
) {
  const settings = getKieImageSettings(size);
  const response = await fetch(`${imageClientConfig.baseURL}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${imageClientConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: imageClientConfig.model,
      input: {
        prompt,
        aspect_ratio: settings.aspectRatio,
        resolution: settings.resolution,
      },
    }),
    cache: "no-store",
  });

  const payload = await parseJsonResponse<KieCreateTaskResponse>(response);

  if (!response.ok || payload?.code !== 200 || !payload.data?.taskId) {
    throw new Error(
      buildKieErrorMessage(payload?.msg || "", `Kie API gagal membuat task gambar (${response.status}).`),
    );
  }

  return payload.data.taskId;
}

async function getKieTaskDetail(
  imageClientConfig: Extract<ImageProviderConfig, { provider: "kie" }>,
  taskId: string,
) {
  const url = new URL("/api/v1/jobs/recordInfo", imageClientConfig.baseURL);
  url.searchParams.set("taskId", taskId);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${imageClientConfig.apiKey}`,
    },
    cache: "no-store",
  });

  const payload = await parseJsonResponse<KieTaskDetailResponse>(response);

  if (!response.ok || payload?.code !== 200 || !payload.data) {
    throw new Error(
      buildKieErrorMessage(payload?.msg || "", `Kie API gagal membaca status task gambar (${response.status}).`),
    );
  }

  return payload.data;
}

function extractKieResultUrl(resultJson: string | undefined) {
  const normalized = cleanText(resultJson);

  if (!normalized) {
    return "";
  }

  try {
    const parsed = JSON.parse(normalized) as { resultUrls?: unknown };
    const firstUrl = Array.isArray(parsed.resultUrls)
      ? parsed.resultUrls.find((value) => typeof value === "string" && value.trim())
      : null;
    return typeof firstUrl === "string" ? firstUrl.trim() : "";
  } catch {
    return "";
  }
}

async function waitForKieImageUrl(
  imageClientConfig: Extract<ImageProviderConfig, { provider: "kie" }>,
  taskId: string,
) {
  const deadline = Date.now() + KIE_POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const detail = await getKieTaskDetail(imageClientConfig, taskId);
    const state = cleanText(detail.state).toLowerCase();

    if (state === "success") {
      const resultUrl = extractKieResultUrl(detail.resultJson);

      if (!resultUrl) {
        throw new Error("Kie API menyelesaikan task tanpa URL gambar.");
      }

      return resultUrl;
    }

    if (state === "fail") {
      throw new Error(buildKieErrorMessage(detail.failMsg || "", "Kie API gagal membuat gambar."));
    }

    await wait(KIE_POLL_INTERVAL_MS);
  }

  throw new Error("Kie API melebihi batas waktu generate gambar.");
}

async function downloadGeneratedImage(rawUrl: string, providerLabel: string) {
  const imageResponse = await fetch(rawUrl, {
    cache: "no-store",
  });

  if (!imageResponse.ok) {
    throw new Error(`Gagal mengunduh hasil gambar ${providerLabel}: ${imageResponse.status}`);
  }

  return Buffer.from(await imageResponse.arrayBuffer());
}

async function generateImageAsset(
  imageClientConfig: ImageProviderConfig,
  prompt: string,
  size: "1024x1024" | "1536x1024",
  userHint: string,
) {
  if (imageClientConfig.provider === "replicate") {
    const aspectRatio = size === "1536x1024" ? "3:2" : "1:1";
    const output = await imageClientConfig.client.run(
      imageClientConfig.model as `${string}/${string}` | `${string}/${string}:${string}`,
      {
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          output_format: "webp",
          output_quality: 80,
          safety_tolerance: 2,
          prompt_upsampling: true,
        },
      },
    );

    const rawUrl =
      typeof output === "string"
        ? output
        : Array.isArray(output)
          ? output.find((item) => typeof item === "string")
          : output && typeof output === "object" && String(output).startsWith("http")
            ? String(output)
          : output && typeof output === "object" && "url" in output && typeof output.url === "string"
            ? output.url
            : null;

    if (!rawUrl) {
      throw new Error("Replicate tidak mengembalikan URL gambar.");
    }

    const buffer = await downloadGeneratedImage(rawUrl, "Replicate");
    const persisted = await persistGeneratedImage(buffer, "webp");
    return persisted.path;
  }

  if (imageClientConfig.provider === "kie") {
    const taskId = await createKieImageTask(imageClientConfig, prompt, size);
    const rawUrl = await waitForKieImageUrl(imageClientConfig, taskId);
    const buffer = await downloadGeneratedImage(rawUrl, "Kie");
    const persisted = await persistGeneratedImage(buffer, detectImageFormat(buffer, "png"));
    return persisted.path;
  }

  const response = await imageClientConfig.client.images.generate({
    model: imageClientConfig.model,
    prompt,
    size,
    quality: "low",
    output_format: "jpeg",
    output_compression: 82,
    user: userHint,
  });

  const base64Image = response.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error("Model gambar tidak mengembalikan data gambar.");
  }

  const persisted = await persistGeneratedImage(Buffer.from(base64Image, "base64"), response.output_format ?? "jpeg");
  return persisted.path;
}

function getImageProviderUnavailableMessage() {
  if (getTextProvider() === "anthropic") {
    return `${getAnthropicModel()} berhasil dipakai untuk generate teks, tetapi provider gambar belum dikonfigurasi. Tambahkan KIE_API_KEY untuk Kie GPT Image atau pakai provider legacy melalui REPLICATE_API_TOKEN + REPLICATE_IMAGE_MODEL / IMAGE_API_KEY + IMAGE_MODEL, atau upload gambar manual.`;
  }

  return `Model teks ${getOpenAICompatibleTextModel()} sudah aktif, tetapi provider gambar belum dikonfigurasi. Tambahkan KIE_API_KEY untuk Kie GPT Image atau pakai provider legacy melalui REPLICATE_API_TOKEN + REPLICATE_IMAGE_MODEL / IMAGE_API_KEY + IMAGE_MODEL, atau upload gambar manual.`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function isReplicateAuthError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("replicate") &&
    (message.includes("401") || message.includes("unauthenticated") || message.includes("authentication token"))
  );
}

function isKieAuthError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("kie api") && (message.includes("401") || message.includes("unauthorized"));
}

function isOpenAiCompatibleImageAuthError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return (
    (message.includes("401") || message.includes("unauthorized") || message.includes("incorrect api key")) &&
    (message.includes("openai") || message.includes("api key"))
  );
}

function isImageProviderAuthError(error: unknown) {
  return isReplicateAuthError(error) || isKieAuthError(error) || isOpenAiCompatibleImageAuthError(error);
}

function getImageProviderAuthReviewNote(imageClientConfig: ImageProviderConfig) {
  if (imageClientConfig.provider === "kie") {
    return "Kie API menolak autentikasi generate gambar. Perbarui KIE_API_KEY dengan key yang masih aktif, lalu coba generate ulang.";
  }

  if (imageClientConfig.provider === "replicate") {
    return "Replicate menolak autentikasi generate gambar. Perbarui REPLICATE_API_TOKEN dengan token baru yang masih aktif, lalu coba generate ulang.";
  }

  return "Provider gambar menolak autentikasi. Periksa IMAGE_API_KEY, IMAGE_API_BASE_URL, dan IMAGE_MODEL sebelum generate ulang.";
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateImageWithRetry(
  imageClientConfig: ImageProviderConfig,
  prompt: string,
  size: "1024x1024" | "1536x1024",
  userHint: string,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await generateImageAsset(imageClientConfig, prompt, size, userHint);
    } catch (error) {
      lastError = error;

      if (isImageProviderAuthError(error) || attempt === 2) {
        break;
      }

      await wait(800 * attempt);
    }
  }

  throw lastError;
}

async function generateVisualAssets(
  input: GenerateBusinessContentInput,
  content: AiBusinessContent,
): Promise<VisualAssetSet> {
  const imageClientConfig = getImageProviderConfig();

  if (!imageClientConfig) {
    return {
      heroImage: null,
      galleryImageUrls: content.galleryItems.map(() => null),
      reviewNotes: [getImageProviderUnavailableMessage()],
    };
  }

  let heroImage: string | null = null;
  const galleryImageUrls = content.galleryItems.map(() => null as string | null);
  const reviewNotes: string[] = [];
  let failedGalleryCount = 0;
  let authFailureDetected = false;

  try {
    heroImage = await generateImageWithRetry(
      imageClientConfig,
      content.heroImagePrompt,
      "1536x1024",
      `hero:${content.businessName || "business"}`,
    );
  } catch (error) {
    reviewNotes.push("Gambar hero AI belum berhasil dibuat. Anda masih bisa upload gambar manual bila diperlukan.");

    if (isImageProviderAuthError(error)) {
      authFailureDetected = true;
    }
  }

  if (!authFailureDetected) {
    for (const [index, item] of content.galleryItems.entries()) {
      try {
        galleryImageUrls[index] = await generateImageWithRetry(
          imageClientConfig,
          item.imagePrompt,
          "1024x1024",
          `gallery:${content.businessName || "business"}:${index}`,
        );
      } catch (error) {
        failedGalleryCount += 1;

        if (isImageProviderAuthError(error)) {
          authFailureDetected = true;
          failedGalleryCount += content.galleryItems.length - index - 1;
          break;
        }
      }
    }
  } else {
    failedGalleryCount = content.galleryItems.length;
  }

  if (authFailureDetected) {
    reviewNotes.push(getImageProviderAuthReviewNote(imageClientConfig));
  } else if (failedGalleryCount > 0) {
    reviewNotes.push(`${failedGalleryCount} gambar galeri AI belum berhasil dibuat. Slot yang kosong masih bisa diisi manual.`);
  }

  return {
    heroImage,
    galleryImageUrls,
    reviewNotes,
  };
}

export async function generateBusinessContentWithAi(input: GenerateBusinessContentInput) {
  const { systemPrompt, userPrompt } = buildFullPrompt(input);
  const parsed = await runJsonChat(systemPrompt, userPrompt);
  const normalized = normalizeBusinessContent(parsed, input);
  const visuals = await generateVisualAssets(input, normalized);

  const generated: AiBusinessContent = {
    ...normalized,
    heroImage: visuals.heroImage,
    galleryItems: normalized.galleryItems.map((item, index) => ({
      ...item,
      imageUrl: visuals.galleryImageUrls[index] ?? item.imageUrl ?? null,
    })),
  };

  return {
    ...generated,
    reviewNotes: buildFallbackReviewNotes(input.currentDraft, {
      phone: generated.phone,
      whatsapp: generated.whatsapp,
      address: generated.address,
      reviewNotes: [...generated.reviewNotes, ...visuals.reviewNotes],
    }),
  };
}

export async function generateBusinessSectionWithAi(input: GenerateSectionInput) {
  const { systemPrompt, userPrompt } = buildSectionPrompt(input);
  const parsed = await runJsonChat(systemPrompt, userPrompt);
  return normalizeSectionResult(parsed, input);
}
