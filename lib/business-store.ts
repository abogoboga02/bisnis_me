import "server-only";

import { DEFAULT_ADMIN_AI_CREDITS_TENTHS } from "@/lib/ai-business-content";
import type {
  AdminAiQuota,
  AdminIdentity,
  AdminRole,
  Business,
  GalleryItem,
  ManagedUser,
  Service,
  Template,
  Testimonial,
} from "@/lib/types";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applyTemplateDefaults, getTemplateFormConfig } from "@/lib/template-form-config";
import { isValidIndonesiaInternationalNumber, normalizePhoneNumber } from "@/lib/contact-utils";

type TemplateRow = {
  id: number;
  name: string;
  key: string;
  description: string | null;
  accent: string | null;
  category: string | null;
  category_label: string | null;
  fit: string | null;
  feature: string | null;
  preview_image: string | null;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number | null;
};

type TestimonialRow = {
  id: number;
  business_id: number;
  name: string;
  role: string | null;
  quote: string | null;
  sort_order: number | null;
};

type GalleryItemRow = {
  id: number;
  business_id: number;
  title: string;
  caption: string | null;
  image_url: string | null;
  sort_order: number | null;
};

type BusinessRow = {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hero_label: string | null;
  hero_image: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
  about_title: string | null;
  about_intro: string | null;
  services_title: string | null;
  services_intro: string | null;
  testimonials_title: string | null;
  testimonials_intro: string | null;
  gallery_title: string | null;
  gallery_intro: string | null;
  contact_title: string | null;
  contact_intro: string | null;
  boardmemo_label: string | null;
  boardmemo_title: string | null;
  boardmemo_body: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  template_id: number | null;
  created_at: string;
  updated_at: string;
};

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: AdminRole | null;
  ai_credits_tenths?: number | null;
  created_at?: string;
  updated_at?: string;
};

type BusinessAccessRow = {
  user_id?: number;
  business_id: number;
};

type CreateAdminUserPayload = {
  email?: unknown;
  name?: unknown;
  password?: unknown;
  role?: unknown;
  businessId?: unknown;
  aiCreditsTenths?: unknown;
};

type BusinessPayload = Partial<Business>;

type AppError = Error & { status?: number };

type NormalizedBusinessPayload = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroLabel: string;
  heroImage: string | null;
  heroCtaLabel: string;
  heroCtaUrl: string;
  aboutTitle: string;
  aboutIntro: string;
  servicesTitle: string;
  servicesIntro: string;
  testimonialsTitle: string;
  testimonialsIntro: string;
  galleryTitle: string;
  galleryIntro: string;
  contactTitle: string;
  contactIntro: string;
  boardmemoLabel: string;
  boardmemoTitle: string;
  boardmemoBody: string;
  phone: string;
  whatsapp: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string | null;
  templateId: number | null;
  services: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
  }>;
  galleryItems: Array<{
    title: string;
    caption: string;
    imageUrl: string | null;
  }>;
};

type RelatedCollections = {
  servicesByBusinessId: Map<number, ServiceRow[]>;
  testimonialsByBusinessId: Map<number, TestimonialRow[]>;
  galleryByBusinessId: Map<number, GalleryItemRow[]>;
};

const TEMPLATE_SELECT =
  "id, name, key, description, accent, category, category_label, fit, feature, preview_image, created_at, updated_at";
const BUSINESS_SELECT =
  "id, slug, name, tagline, description, hero_label, hero_image, hero_cta_label, hero_cta_url, about_title, about_intro, services_title, services_intro, testimonials_title, testimonials_intro, gallery_title, gallery_intro, contact_title, contact_intro, boardmemo_label, boardmemo_title, boardmemo_body, phone, whatsapp, address, meta_title, meta_description, og_image, template_id, created_at, updated_at";

function createHttpError(status: number, message: string) {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
}

function normalizeSupabaseErrorMessage(message: string) {
  if (message.includes("Invalid schema")) {
    return "Schema Supabase belum aktif untuk API. Tambahkan schema bisnis_me ke Exposed schemas di Supabase.";
  }

  if (message.includes("ai_credits_tenths")) {
    return "Kolom token AI belum tersedia. Jalankan database/supabase-ai-token-upgrade.sql di Supabase SQL Editor.";
  }

  if (
    (message.includes("column") && message.includes("does not exist")) ||
    (message.includes("relation") && message.includes("does not exist"))
  ) {
    return "Schema database belum di-upgrade. Jalankan database/supabase-content-role-upgrade.sql di Supabase SQL Editor.";
  }

  return message;
}

function throwSupabaseError(status: number, message: string): never {
  throw createHttpError(status, normalizeSupabaseErrorMessage(message));
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isSafeAbsoluteUrl(value: string, allowedProtocols: string[]) {
  try {
    const url = new URL(value);
    return allowedProtocols.includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeMediaUrl(value: unknown) {
  const text = cleanText(value);
  if (!text) {
    return null;
  }

  if (text.startsWith("/")) {
    return text;
  }

  return isSafeAbsoluteUrl(text, ["http:", "https:"]) ? text : null;
}

function normalizeActionUrl(value: unknown) {
  const text = cleanText(value);
  if (!text) {
    return "#contact";
  }

  if (text.startsWith("#") || text.startsWith("/")) {
    return text;
  }

  return isSafeAbsoluteUrl(text, ["http:", "https:", "mailto:", "tel:"]) ? text : "#contact";
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeOptionalBusinessId(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function normalizeOptionalCreditTenths(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return DEFAULT_ADMIN_AI_CREDITS_TENTHS;
}

function resolveAiCreditsTenths(row: Pick<UserRow, "role" | "ai_credits_tenths">) {
  if (row.role === "owner") {
    return null;
  }

  return row.ai_credits_tenths ?? DEFAULT_ADMIN_AI_CREDITS_TENTHS;
}

function groupRowsByBusinessId<Row extends { business_id: number }>(rows: Row[] | null) {
  const grouped = new Map<number, Row[]>();

  for (const row of rows ?? []) {
    const current = grouped.get(row.business_id) ?? [];
    current.push(row);
    grouped.set(row.business_id, current);
  }

  return grouped;
}

function mapServiceRow(row: ServiceRow): Service {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    description: row.description ?? "",
    icon: row.icon ?? "sparkles",
  };
}

function mapTestimonialRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    role: row.role ?? "",
    quote: row.quote ?? "",
    sortOrder: row.sort_order ?? 0,
  };
}

function mapGalleryItemRow(row: GalleryItemRow): GalleryItem {
  return {
    id: row.id,
    businessId: row.business_id,
    title: row.title,
    caption: row.caption ?? "",
    imageUrl: row.image_url ?? "",
    sortOrder: row.sort_order ?? 0,
  };
}

function mapTemplateRow(row: TemplateRow): Template {
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    description: row.description ?? "",
    accent: row.accent,
    category: row.category ?? "company-profile",
    categoryLabel: row.category_label ?? "Company Profile",
    fit: row.fit ?? "",
    feature: row.feature ?? "",
    previewImage: row.preview_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapManagedUserRow(row: UserRow, businessIds: number[]): ManagedUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role === "owner" ? "owner" : "admin",
    businessIds,
    aiCreditsTenths: resolveAiCreditsTenths(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBusinessRow(
  row: BusinessRow,
  related: RelatedCollections,
  template: TemplateRow | null,
): Business {
  const services = (related.servicesByBusinessId.get(row.id) ?? [])
    .slice()
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0) || left.id - right.id)
    .map(mapServiceRow);
  const testimonials = (related.testimonialsByBusinessId.get(row.id) ?? [])
    .slice()
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0) || left.id - right.id)
    .map(mapTestimonialRow);
  const galleryItems = (related.galleryByBusinessId.get(row.id) ?? [])
    .slice()
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0) || left.id - right.id)
    .map(mapGalleryItemRow);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    heroLabel: row.hero_label ?? "Business website",
    heroImage: row.hero_image,
    heroCtaLabel: row.hero_cta_label ?? "Contact Us",
    heroCtaUrl: row.hero_cta_url ?? "#contact",
    aboutTitle: row.about_title ?? "Tentang bisnis",
    aboutIntro: row.about_intro ?? row.description ?? "",
    servicesTitle: row.services_title ?? "Layanan utama",
    servicesIntro: row.services_intro ?? row.tagline ?? "",
    testimonialsTitle: row.testimonials_title ?? "Testimoni klien",
    testimonialsIntro: row.testimonials_intro ?? "",
    galleryTitle: row.gallery_title ?? "Galeri",
    galleryIntro: row.gallery_intro ?? "",
    contactTitle: row.contact_title ?? "Hubungi kami",
    contactIntro: row.contact_intro ?? "",
    boardmemoLabel: row.boardmemo_label ?? "Board Memo",
    boardmemoTitle: row.boardmemo_title ?? "Structured direction for a sharper first impression.",
    boardmemoBody: row.boardmemo_body ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    address: row.address ?? "",
    metaTitle: row.meta_title ?? row.name,
    metaDescription: row.meta_description ?? row.description ?? "",
    ogImage: row.og_image,
    templateId: row.template_id,
    templateKey: template?.key ?? null,
    templateName: template?.name ?? null,
    templateAccent: template?.accent ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    services,
    testimonials,
    galleryItems,
  };
}

function normalizePayload(payload: BusinessPayload): NormalizedBusinessPayload {
  const name = cleanText(payload.name);
  const description = cleanText(payload.description);
  const tagline = cleanText(payload.tagline);
  const normalized = {
    slug: cleanText(payload.slug).toLowerCase(),
    name,
    tagline,
    description,
    heroLabel: cleanText(payload.heroLabel) || "Business website",
    heroImage: normalizeMediaUrl(payload.heroImage),
    heroCtaLabel: cleanText(payload.heroCtaLabel) || "Contact Us",
    heroCtaUrl: normalizeActionUrl(payload.heroCtaUrl),
    aboutTitle: cleanText(payload.aboutTitle) || "Tentang bisnis",
    aboutIntro: cleanText(payload.aboutIntro) || description,
    servicesTitle: cleanText(payload.servicesTitle) || "Layanan utama",
    servicesIntro: cleanText(payload.servicesIntro) || tagline,
    testimonialsTitle: cleanText(payload.testimonialsTitle) || "Testimoni klien",
    testimonialsIntro: cleanText(payload.testimonialsIntro),
    galleryTitle: cleanText(payload.galleryTitle) || "Galeri",
    galleryIntro: cleanText(payload.galleryIntro),
    contactTitle: cleanText(payload.contactTitle) || "Hubungi kami",
    contactIntro: cleanText(payload.contactIntro),
    boardmemoLabel: cleanText(payload.boardmemoLabel) || "Board Memo",
    boardmemoTitle: cleanText(payload.boardmemoTitle) || "Structured direction for a sharper first impression.",
    boardmemoBody: cleanText(payload.boardmemoBody),
    phone: normalizePhoneNumber(cleanText(payload.phone)),
    whatsapp: normalizePhoneNumber(cleanText(payload.whatsapp)),
    address: cleanText(payload.address),
    metaTitle: cleanText(payload.metaTitle) || name,
    metaDescription: cleanText(payload.metaDescription) || description,
    ogImage: normalizeMediaUrl(payload.ogImage),
    templateId: typeof payload.templateId === "number" ? payload.templateId : null,
    services: Array.isArray(payload.services)
      ? payload.services
          .map((service) => ({
            name: cleanText(service.name),
            description: cleanText(service.description),
            icon: cleanText(service.icon) || "sparkles",
          }))
          .filter((service) => service.name || service.description)
      : [],
    testimonials: Array.isArray(payload.testimonials)
      ? payload.testimonials
          .map((testimonial) => ({
            name: cleanText(testimonial.name),
            role: cleanText(testimonial.role),
            quote: cleanText(testimonial.quote),
          }))
          .filter((testimonial) => testimonial.name || testimonial.role || testimonial.quote)
      : [],
    galleryItems: Array.isArray(payload.galleryItems)
      ? payload.galleryItems
          .map((item) => ({
            title: cleanText(item.title),
            caption: cleanText(item.caption),
            imageUrl: normalizeMediaUrl(item.imageUrl),
          }))
          .filter((item) => item.title || item.caption || item.imageUrl)
      : [],
  };

  return applyTemplateDefaults(normalized, cleanText(payload.templateKey) || null);
}

function validateBusinessPayload(payload: NormalizedBusinessPayload, templateKey: string | null) {
  if (!payload.slug || !payload.name) {
    throw createHttpError(400, "Slug dan nama bisnis wajib diisi.");
  }

  if (!/^[a-z0-9-]+$/.test(payload.slug)) {
    throw createHttpError(400, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");
  }

  if (!payload.tagline || !payload.description) {
    throw createHttpError(400, "Tagline dan deskripsi bisnis wajib diisi.");
  }

  if (!payload.templateId) {
    throw createHttpError(400, "Template bisnis wajib dipilih.");
  }

  if (!payload.phone || !payload.whatsapp) {
    throw createHttpError(400, "Nomor telepon dan WhatsApp wajib diisi.");
  }

  if (!isValidIndonesiaInternationalNumber(payload.phone) || !isValidIndonesiaInternationalNumber(payload.whatsapp)) {
    throw createHttpError(400, "Nomor telepon dan WhatsApp wajib diawali 62.");
  }

  if (!payload.address || !payload.heroImage || !payload.heroCtaLabel) {
    throw createHttpError(400, "Alamat, tombol utama, dan gambar utama wajib diisi.");
  }

  if (!payload.aboutIntro || !payload.servicesIntro || !payload.testimonialsIntro || !payload.galleryIntro || !payload.contactIntro) {
    throw createHttpError(400, "Seluruh isi section wajib diisi.");
  }

  if (!Array.isArray(payload.services) || payload.services.length === 0) {
    throw createHttpError(400, "Minimal harus ada satu layanan.");
  }

  const templateConfig = getTemplateFormConfig(templateKey);

  if (templateConfig?.minFilledServiceCount && payload.services.length < templateConfig.minFilledServiceCount) {
    throw createHttpError(400, `Template ini wajib memiliki minimal ${templateConfig.minFilledServiceCount} layanan.`);
  }

  if (templateConfig?.maxFilledServiceCount && payload.services.length > templateConfig.maxFilledServiceCount) {
    throw createHttpError(400, `Template ini hanya mendukung maksimal ${templateConfig.maxFilledServiceCount} layanan.`);
  }

  for (const service of payload.services) {
    if (!service.name) {
      throw createHttpError(400, "Nama layanan wajib diisi.");
    }

    if (!service.description) {
      throw createHttpError(400, "Deskripsi layanan wajib diisi.");
    }
  }

  for (const testimonial of payload.testimonials) {
    if (!testimonial.name || !testimonial.role || !testimonial.quote) {
      throw createHttpError(400, "Setiap testimoni wajib punya nama, jabatan, dan kutipan.");
    }
  }

  for (const item of payload.galleryItems) {
    if (!item.title || !item.caption || !item.imageUrl) {
      throw createHttpError(400, "Setiap item galeri wajib punya judul, keterangan, dan gambar.");
    }
  }

  if (templateConfig?.fixedTestimonialCount && payload.testimonials.length !== templateConfig.fixedTestimonialCount) {
    throw createHttpError(400, `Template ini wajib memiliki ${templateConfig.fixedTestimonialCount} testimoni.`);
  }

  if (templateConfig?.fixedGalleryCount && payload.galleryItems.length !== templateConfig.fixedGalleryCount) {
    throw createHttpError(400, `Template ini wajib memiliki ${templateConfig.fixedGalleryCount} item galeri.`);
  }
}

async function requireTemplateRow(templateId: number | null) {
  if (!templateId) {
    throw createHttpError(400, "Template bisnis wajib dipilih.");
  }

  const rows = await fetchTemplateRows([templateId]);
  const template = rows[0] ?? null;

  if (!template) {
    throw createHttpError(404, "Template bisnis tidak ditemukan.");
  }

  return template;
}

async function getAccessibleBusinessIds(admin?: AdminIdentity) {
  if (!admin || admin.role === "owner") {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_business_access")
    .select("business_id")
    .eq("user_id", admin.id)
    .order("business_id", { ascending: true });

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return ((data as BusinessAccessRow[] | null) ?? []).map((item) => item.business_id);
}

async function requireOwner(admin: AdminIdentity) {
  if (admin.role !== "owner") {
    throw createHttpError(403, "Hanya owner yang bisa mengelola user.");
  }
}

async function getUserRowById(userId: number) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password_hash, name, role, ai_credits_tenths, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return (data as UserRow | null) ?? null;
}

export async function getAdminAiQuota(admin: AdminIdentity): Promise<AdminAiQuota> {
  if (admin.role === "owner") {
    return {
      remainingTenths: null,
      unlimited: true,
    };
  }

  const user = await getUserRowById(admin.id);

  if (!user) {
    throw createHttpError(404, "User admin tidak ditemukan.");
  }

  return {
    remainingTenths: resolveAiCreditsTenths(user),
    unlimited: false,
  };
}

export async function consumeAdminAiCredits(admin: AdminIdentity, costTenths: number): Promise<AdminAiQuota> {
  if (admin.role === "owner") {
    return {
      remainingTenths: null,
      unlimited: true,
    };
  }

  if (!Number.isInteger(costTenths) || costTenths <= 0) {
    throw createHttpError(400, "Biaya token AI tidak valid.");
  }

  const user = await getUserRowById(admin.id);
  if (!user) {
    throw createHttpError(404, "User admin tidak ditemukan.");
  }

  const remainingTenths = resolveAiCreditsTenths(user);

  if (remainingTenths === null) {
    return {
      remainingTenths: null,
      unlimited: true,
    };
  }

  if (remainingTenths < costTenths) {
    throw createHttpError(
      403,
      "Token AI Anda tidak mencukupi. Hubungi admin untuk menambah token sebelum generate lagi.",
    );
  }

  const nextCredits = remainingTenths - costTenths;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("users")
    .update({
      ai_credits_tenths: nextCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", admin.id);

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return {
    remainingTenths: nextCredits,
    unlimited: false,
  };
}

async function listAllUserAccessRows() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_business_access")
    .select("user_id, business_id")
    .order("user_id", { ascending: true })
    .order("business_id", { ascending: true });

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return (data as Array<{ user_id: number; business_id: number }> | null) ?? [];
}

function groupBusinessIdsByUserId(rows: Array<{ user_id: number; business_id: number }>) {
  const grouped = new Map<number, number[]>();

  for (const row of rows) {
    const current = grouped.get(row.user_id) ?? [];
    current.push(row.business_id);
    grouped.set(row.user_id, current);
  }

  return grouped;
}

function validateCreateAdminUserPayload(payload: {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  businessId: number | null;
  aiCreditsTenths: number;
}) {
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw createHttpError(400, "Email user wajib valid.");
  }

  if (!payload.name) {
    throw createHttpError(400, "Nama user wajib diisi.");
  }

  if (!payload.password || payload.password.length < 8) {
    throw createHttpError(400, "Password minimal 8 karakter.");
  }

  if (payload.role !== "owner" && payload.role !== "admin") {
    throw createHttpError(400, "Role user hanya boleh owner atau admin.");
  }

  if (payload.role === "owner" && payload.businessId) {
    throw createHttpError(400, "Owner tidak perlu dihubungkan ke bisnis tertentu.");
  }

  if (payload.role === "admin" && (!Number.isInteger(payload.aiCreditsTenths) || payload.aiCreditsTenths < 0)) {
    throw createHttpError(400, "Token AI user harus berupa angka bulat nol atau lebih.");
  }
}

async function assertBusinessExists(businessId: number) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("businesses").select("id").eq("id", businessId).maybeSingle();

  if (error) {
    throwSupabaseError(500, error.message);
  }

  if (!data) {
    throw createHttpError(404, "Bisnis yang dipilih tidak ditemukan.");
  }
}

async function ensureBusinessAccess(admin: AdminIdentity | undefined, businessId: number) {
  if (!admin || admin.role === "owner") {
    return;
  }

  const businessIds = await getAccessibleBusinessIds(admin);
  if (!businessIds || !businessIds.includes(businessId)) {
    throw createHttpError(403, "Anda tidak punya akses ke bisnis ini.");
  }
}

async function fetchTemplateRows(templateIds?: number[]) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("templates").select(TEMPLATE_SELECT).order("id", { ascending: true });

  if (templateIds) {
    if (templateIds.length === 0) {
      return [];
    }

    query = query.in("id", templateIds);
  }

  const { data, error } = await query;
  if (error) {
    throwSupabaseError(500, error.message);
  }

  return (data as TemplateRow[] | null) ?? [];
}

async function fetchBusinessRows(businessIds?: number[]) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("businesses").select(BUSINESS_SELECT).order("id", { ascending: true });

  if (businessIds) {
    if (businessIds.length === 0) {
      return [];
    }

    query = query.in("id", businessIds);
  }

  const { data, error } = await query;
  if (error) {
    throwSupabaseError(500, error.message);
  }

  return (data as BusinessRow[] | null) ?? [];
}

async function fetchRelatedCollections(businessIds: number[]): Promise<RelatedCollections> {
  if (businessIds.length === 0) {
    return {
      servicesByBusinessId: new Map(),
      testimonialsByBusinessId: new Map(),
      galleryByBusinessId: new Map(),
    };
  }

  const supabase = getSupabaseAdmin();
  const [
    { data: serviceData, error: serviceError },
    { data: testimonialData, error: testimonialError },
    { data: galleryData, error: galleryError },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id, business_id, name, description, icon, sort_order")
      .in("business_id", businessIds)
      .order("business_id", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
    supabase
      .from("testimonials")
      .select("id, business_id, name, role, quote, sort_order")
      .in("business_id", businessIds)
      .order("business_id", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
    supabase
      .from("gallery_items")
      .select("id, business_id, title, caption, image_url, sort_order")
      .in("business_id", businessIds)
      .order("business_id", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
  ]);

  if (serviceError) {
    throwSupabaseError(500, serviceError.message);
  }

  if (testimonialError) {
    throwSupabaseError(500, testimonialError.message);
  }

  if (galleryError) {
    throwSupabaseError(500, galleryError.message);
  }

  return {
    servicesByBusinessId: groupRowsByBusinessId((serviceData as ServiceRow[] | null) ?? []),
    testimonialsByBusinessId: groupRowsByBusinessId((testimonialData as TestimonialRow[] | null) ?? []),
    galleryByBusinessId: groupRowsByBusinessId((galleryData as GalleryItemRow[] | null) ?? []),
  };
}

async function buildBusinessesFromRows(rows: BusinessRow[]) {
  if (rows.length === 0) {
    return [];
  }

  const templateIds = [...new Set(rows.map((row) => row.template_id).filter((value): value is number => Boolean(value)))];
  const [related, templateRows] = await Promise.all([
    fetchRelatedCollections(rows.map((row) => row.id)),
    fetchTemplateRows(templateIds),
  ]);

  const templatesById = new Map<number, TemplateRow>(templateRows.map((row) => [row.id, row]));
  return rows.map((row) => mapBusinessRow(row, related, templatesById.get(row.template_id ?? -1) ?? null));
}

async function replaceBusinessRelations(businessId: number, payload: NormalizedBusinessPayload) {
  const supabase = getSupabaseAdmin();

  const { error: deleteServicesError } = await supabase.from("services").delete().eq("business_id", businessId);
  if (deleteServicesError) {
    throwSupabaseError(500, deleteServicesError.message);
  }

  const { error: deleteTestimonialsError } = await supabase.from("testimonials").delete().eq("business_id", businessId);
  if (deleteTestimonialsError) {
    throwSupabaseError(500, deleteTestimonialsError.message);
  }

  const { error: deleteGalleryError } = await supabase.from("gallery_items").delete().eq("business_id", businessId);
  if (deleteGalleryError) {
    throwSupabaseError(500, deleteGalleryError.message);
  }

  if (payload.services.length > 0) {
    const { error: servicesError } = await supabase.from("services").insert(
      payload.services.map((service, index) => ({
        business_id: businessId,
        name: service.name,
        description: service.description,
        icon: service.icon,
        sort_order: index,
      })),
    );

    if (servicesError) {
      throwSupabaseError(500, servicesError.message);
    }
  }

  if (payload.testimonials.length > 0) {
    const { error: testimonialsError } = await supabase.from("testimonials").insert(
      payload.testimonials.map((testimonial, index) => ({
        business_id: businessId,
        name: testimonial.name,
        role: testimonial.role,
        quote: testimonial.quote,
        sort_order: index,
      })),
    );

    if (testimonialsError) {
      throwSupabaseError(500, testimonialsError.message);
    }
  }

  if (payload.galleryItems.length > 0) {
    const { error: galleryError } = await supabase.from("gallery_items").insert(
      payload.galleryItems.map((item, index) => ({
        business_id: businessId,
        title: item.title,
        caption: item.caption,
        image_url: item.imageUrl,
        sort_order: index,
      })),
    );

    if (galleryError) {
      throwSupabaseError(500, galleryError.message);
    }
  }
}

export async function listTemplatesFromDatabase(admin?: AdminIdentity) {
  void admin;
  const rows = await fetchTemplateRows();
  return rows.map(mapTemplateRow);
}

export async function listBusinessesFromDatabase(admin?: AdminIdentity) {
  const accessibleBusinessIds = await getAccessibleBusinessIds(admin);
  const rows = await fetchBusinessRows(accessibleBusinessIds ?? undefined);
  return buildBusinessesFromRows(rows);
}

export async function getBusinessByIdForAdmin(id: number, admin?: AdminIdentity) {
  await ensureBusinessAccess(admin, id);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("businesses").select(BUSINESS_SELECT).eq("id", id).maybeSingle();

  if (error) {
    throwSupabaseError(500, error.message);
  }

  if (!data) {
    return null;
  }

  const businesses = await buildBusinessesFromRows([data as BusinessRow]);
  return businesses[0] ?? null;
}

export async function getBusinessBySlugFromDatabase(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("businesses").select(BUSINESS_SELECT).eq("slug", normalizedSlug).maybeSingle();

  if (error) {
    throwSupabaseError(500, error.message);
  }

  if (!data) {
    return null;
  }

  const businesses = await buildBusinessesFromRows([data as BusinessRow]);
  return businesses[0] ?? null;
}

export async function authenticateAdmin(email: unknown, password: unknown): Promise<AdminIdentity> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail || !normalizedPassword) {
    throw createHttpError(400, "Email dan password wajib diisi.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password_hash, name, role, ai_credits_tenths")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, normalizeSupabaseErrorMessage(error.message));
  }

  if (!data) {
    throw createHttpError(404, "Akun admin tidak ditemukan.");
  }

  const user = data as UserRow;
  if (!verifyPassword(normalizedPassword, user.password_hash)) {
    throw createHttpError(401, "Email atau password salah.");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "owner" ? "owner" : "admin",
  };
}

export async function listManagedUsersFromDatabase(admin: AdminIdentity): Promise<ManagedUser[]> {
  await requireOwner(admin);

  const supabase = getSupabaseAdmin();
  const [{ data: usersData, error: usersError }, accessRows] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, password_hash, name, role, ai_credits_tenths, created_at, updated_at")
      .order("id", { ascending: true }),
    listAllUserAccessRows(),
  ]);

  if (usersError) {
    throwSupabaseError(500, usersError.message);
  }

  const businessIdsByUserId = groupBusinessIdsByUserId(accessRows);
  return ((usersData as UserRow[] | null) ?? []).map((row) => mapManagedUserRow(row, businessIdsByUserId.get(row.id) ?? []));
}

export async function createManagedUserRecord(payload: CreateAdminUserPayload, admin: AdminIdentity): Promise<ManagedUser> {
  await requireOwner(admin);

  const normalized = {
    email: normalizeEmail(payload.email),
    name: cleanText(payload.name),
    password: typeof payload.password === "string" ? payload.password : "",
    role: payload.role === "owner" ? "owner" : "admin",
    businessId: normalizeOptionalBusinessId(payload.businessId),
    aiCreditsTenths: normalizeOptionalCreditTenths(payload.aiCreditsTenths),
  } as const;

  validateCreateAdminUserPayload(normalized);

  if (normalized.role === "admin" && normalized.businessId) {
    await assertBusinessExists(normalized.businessId);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: normalized.email,
      password_hash: hashPassword(normalized.password),
      name: normalized.name,
      role: normalized.role,
      ai_credits_tenths: normalized.role === "admin" ? normalized.aiCreditsTenths : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id, email, password_hash, name, role, ai_credits_tenths, created_at, updated_at")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw createHttpError(409, "Email user sudah terdaftar.");
    }

    throw createHttpError(500, normalizeSupabaseErrorMessage(error?.message ?? "Gagal membuat user."));
  }

  if (normalized.role === "admin" && normalized.businessId) {
    const accessResult = await supabase.from("user_business_access").insert({
      user_id: data.id,
      business_id: normalized.businessId,
    });

    if (accessResult.error) {
      await supabase.from("users").delete().eq("id", data.id);
      throw createHttpError(500, normalizeSupabaseErrorMessage(accessResult.error.message));
    }
  }

  return mapManagedUserRow(data as UserRow, normalized.role === "admin" && normalized.businessId ? [normalized.businessId] : []);
}

export async function topUpManagedUserAiCredits(
  admin: AdminIdentity,
  userId: number,
  deltaTenths: number,
): Promise<ManagedUser> {
  await requireOwner(admin);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createHttpError(400, "User ID tidak valid.");
  }

  if (!Number.isInteger(deltaTenths) || deltaTenths <= 0) {
    throw createHttpError(400, "Jumlah token tambahan tidak valid.");
  }

  const user = await getUserRowById(userId);

  if (!user) {
    throw createHttpError(404, "User tidak ditemukan.");
  }

  if (user.role !== "admin") {
    throw createHttpError(400, "Token AI hanya bisa ditambahkan ke user admin biasa.");
  }

  const nextCredits = (resolveAiCreditsTenths(user) ?? DEFAULT_ADMIN_AI_CREDITS_TENTHS) + deltaTenths;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .update({
      ai_credits_tenths: nextCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, password_hash, name, role, ai_credits_tenths, created_at, updated_at")
    .single();

  if (error || !data) {
    throw createHttpError(500, normalizeSupabaseErrorMessage(error?.message ?? "Gagal menambah token AI user."));
  }

  const accessRows = await listAllUserAccessRows();
  const businessIdsByUserId = groupBusinessIdsByUserId(accessRows);

  return mapManagedUserRow(data as UserRow, businessIdsByUserId.get(userId) ?? []);
}

export async function createBusinessRecord(payload: BusinessPayload, admin: AdminIdentity) {
  if (admin.role !== "owner") {
    const accessibleBusinessIds = await getAccessibleBusinessIds(admin);
    if (accessibleBusinessIds && accessibleBusinessIds.length > 0) {
      throw createHttpError(403, "Akun admin hanya boleh memiliki satu website.");
    }
  }

  const baseNormalized = normalizePayload(payload);
  const template = await requireTemplateRow(baseNormalized.templateId);
  const normalized = applyTemplateDefaults(baseNormalized, template.key);
  validateBusinessPayload(normalized, template.key);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      template_id: normalized.templateId,
      slug: normalized.slug,
      name: normalized.name,
      tagline: normalized.tagline,
      description: normalized.description,
      hero_label: normalized.heroLabel,
      hero_image: normalized.heroImage,
      hero_cta_label: normalized.heroCtaLabel,
      hero_cta_url: normalized.heroCtaUrl,
      about_title: normalized.aboutTitle,
      about_intro: normalized.aboutIntro,
      services_title: normalized.servicesTitle,
      services_intro: normalized.servicesIntro,
      testimonials_title: normalized.testimonialsTitle,
      testimonials_intro: normalized.testimonialsIntro,
      gallery_title: normalized.galleryTitle,
      gallery_intro: normalized.galleryIntro,
      contact_title: normalized.contactTitle,
      contact_intro: normalized.contactIntro,
      boardmemo_label: normalized.boardmemoLabel,
      boardmemo_title: normalized.boardmemoTitle,
      boardmemo_body: normalized.boardmemoBody,
      phone: normalized.phone,
      whatsapp: normalized.whatsapp,
      address: normalized.address,
      meta_title: normalized.metaTitle,
      meta_description: normalized.metaDescription,
      og_image: normalized.ogImage,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw createHttpError(409, "Slug bisnis sudah digunakan.");
    }

    throw createHttpError(500, normalizeSupabaseErrorMessage(error?.message ?? "Gagal membuat bisnis."));
  }

  try {
    await replaceBusinessRelations(data.id, normalized);

    if (admin.role !== "owner") {
      const accessResult = await supabase.from("user_business_access").insert({
        user_id: admin.id,
        business_id: data.id,
      });

      if (accessResult.error) {
        throw createHttpError(500, normalizeSupabaseErrorMessage(accessResult.error.message));
      }
    }
  } catch (relationError) {
    await supabase.from("businesses").delete().eq("id", data.id);
    throw relationError;
  }

  const business = await getBusinessByIdForAdmin(data.id, admin);
  if (!business) {
    throw createHttpError(500, "Bisnis berhasil dibuat tetapi gagal dibaca ulang.");
  }

  return business;
}

export async function updateBusinessRecord(id: number, payload: BusinessPayload, admin: AdminIdentity) {
  await ensureBusinessAccess(admin, id);

  const baseNormalized = normalizePayload(payload);
  const template = await requireTemplateRow(baseNormalized.templateId);
  const normalized = applyTemplateDefaults(baseNormalized, template.key);
  validateBusinessPayload(normalized, template.key);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("businesses")
    .update({
      template_id: normalized.templateId,
      slug: normalized.slug,
      name: normalized.name,
      tagline: normalized.tagline,
      description: normalized.description,
      hero_label: normalized.heroLabel,
      hero_image: normalized.heroImage,
      hero_cta_label: normalized.heroCtaLabel,
      hero_cta_url: normalized.heroCtaUrl,
      about_title: normalized.aboutTitle,
      about_intro: normalized.aboutIntro,
      services_title: normalized.servicesTitle,
      services_intro: normalized.servicesIntro,
      testimonials_title: normalized.testimonialsTitle,
      testimonials_intro: normalized.testimonialsIntro,
      gallery_title: normalized.galleryTitle,
      gallery_intro: normalized.galleryIntro,
      contact_title: normalized.contactTitle,
      contact_intro: normalized.contactIntro,
      boardmemo_label: normalized.boardmemoLabel,
      boardmemo_title: normalized.boardmemoTitle,
      boardmemo_body: normalized.boardmemoBody,
      phone: normalized.phone,
      whatsapp: normalized.whatsapp,
      address: normalized.address,
      meta_title: normalized.metaTitle,
      meta_description: normalized.metaDescription,
      og_image: normalized.ogImage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw createHttpError(409, "Slug bisnis sudah digunakan.");
    }

    throwSupabaseError(500, error.message);
  }

  if (!data) {
    return null;
  }

  await replaceBusinessRelations(id, normalized);
  return getBusinessByIdForAdmin(id, admin);
}

export async function deleteBusinessRecord(id: number, admin: AdminIdentity) {
  if (admin.role !== "owner") {
    throw createHttpError(403, "Hanya owner yang bisa menghapus bisnis.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("businesses").delete().eq("id", id).select("id");

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return Array.isArray(data) && data.length > 0;
}
