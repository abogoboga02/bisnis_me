import "server-only";

import type { Business, Service } from "@/lib/types";
import { verifyPassword } from "@/lib/password";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type TemplateRow = {
  id: number;
  name: string;
  key: string;
  description: string | null;
  accent: string | null;
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

type BusinessRow = {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hero_image: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
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
};

type BusinessPayload = Partial<Business>;

type AppError = Error & { status?: number };

function createHttpError(status: number, message: string) {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
}

function normalizeSupabaseErrorMessage(message: string) {
  if (message.includes("Invalid schema")) {
    return "Schema Supabase belum aktif untuk API. Tambahkan schema bisnis_me ke Exposed schemas di Supabase.";
  }

  return message;
}

function throwSupabaseError(status: number, message: string) {
  throw createHttpError(status, normalizeSupabaseErrorMessage(message));
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

function mapBusinessRow(row: BusinessRow, services: ServiceRow[], template: TemplateRow | null): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    heroImage: row.hero_image,
    heroCtaLabel: row.hero_cta_label ?? "Contact Us",
    heroCtaUrl: row.hero_cta_url ?? "#contact",
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
    services: services
      .slice()
      .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0) || left.id - right.id)
      .map(mapServiceRow),
  };
}

function normalizePayload(payload: BusinessPayload) {
  return {
    slug: typeof payload.slug === "string" ? payload.slug.trim().toLowerCase() : "",
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    tagline: typeof payload.tagline === "string" ? payload.tagline.trim() : "",
    description: typeof payload.description === "string" ? payload.description.trim() : "",
    heroImage: typeof payload.heroImage === "string" && payload.heroImage.trim() ? payload.heroImage.trim() : null,
    heroCtaLabel:
      typeof payload.heroCtaLabel === "string" && payload.heroCtaLabel.trim()
        ? payload.heroCtaLabel.trim()
        : "Contact Us",
    heroCtaUrl:
      typeof payload.heroCtaUrl === "string" && payload.heroCtaUrl.trim()
        ? payload.heroCtaUrl.trim()
        : "#contact",
    phone: typeof payload.phone === "string" ? payload.phone.trim() : "",
    whatsapp: typeof payload.whatsapp === "string" ? payload.whatsapp.trim() : "",
    address: typeof payload.address === "string" ? payload.address.trim() : "",
    metaTitle:
      typeof payload.metaTitle === "string" && payload.metaTitle.trim()
        ? payload.metaTitle.trim()
        : typeof payload.name === "string"
          ? payload.name.trim()
          : "",
    metaDescription:
      typeof payload.metaDescription === "string" && payload.metaDescription.trim()
        ? payload.metaDescription.trim()
        : typeof payload.description === "string"
          ? payload.description.trim()
          : "",
    ogImage: typeof payload.ogImage === "string" && payload.ogImage.trim() ? payload.ogImage.trim() : null,
    templateId: typeof payload.templateId === "number" ? payload.templateId : null,
    services: Array.isArray(payload.services)
      ? payload.services.map((service) => ({
          name: typeof service.name === "string" ? service.name.trim() : "",
          description: typeof service.description === "string" ? service.description.trim() : "",
          icon: typeof service.icon === "string" && service.icon.trim() ? service.icon.trim() : "sparkles",
        }))
      : [],
  };
}

function validateBusinessPayload(payload: ReturnType<typeof normalizePayload>) {
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

  if (!Array.isArray(payload.services) || payload.services.length === 0) {
    throw createHttpError(400, "Minimal harus ada satu layanan.");
  }

  for (const service of payload.services) {
    if (!service.name) {
      throw createHttpError(400, "Nama layanan wajib diisi.");
    }

    if (!service.description) {
      throw createHttpError(400, "Deskripsi layanan wajib diisi.");
    }
  }
}

async function getTemplateById(templateId: number | null) {
  if (!templateId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("templates")
    .select("id, name, key, description, accent, created_at, updated_at")
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return (data as TemplateRow | null) ?? null;
}

async function getServicesByBusinessId(businessId: number) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("services")
    .select("id, business_id, name, description, icon, sort_order")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return (data as ServiceRow[] | null) ?? [];
}

export async function getBusinessByIdForAdmin(id: number) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, slug, name, tagline, description, hero_image, hero_cta_label, hero_cta_url, phone, whatsapp, address, meta_title, meta_description, og_image, template_id, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwSupabaseError(500, error.message);
  }

  if (!data) {
    return null;
  }

  const [services, template] = await Promise.all([
    getServicesByBusinessId(id),
    getTemplateById((data as BusinessRow).template_id),
  ]);

  return mapBusinessRow(data as BusinessRow, services, template);
}

export async function authenticateAdmin(email: unknown, password: unknown) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail || !normalizedPassword) {
    throw createHttpError(400, "Email dan password wajib diisi.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password_hash, name")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, error.message);
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
  };
}

export async function createBusinessRecord(payload: BusinessPayload) {
  const normalized = normalizePayload(payload);
  validateBusinessPayload(normalized);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      template_id: normalized.templateId,
      slug: normalized.slug,
      name: normalized.name,
      tagline: normalized.tagline,
      description: normalized.description,
      hero_image: normalized.heroImage,
      hero_cta_label: normalized.heroCtaLabel,
      hero_cta_url: normalized.heroCtaUrl,
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

  if (normalized.services.length > 0) {
    const { error: servicesError } = await supabase.from("services").insert(
      normalized.services.map((service, index) => ({
        business_id: data.id,
        name: service.name,
        description: service.description,
        icon: service.icon,
        sort_order: index,
      })),
    );

    if (servicesError) {
      await supabase.from("businesses").delete().eq("id", data.id);
      throwSupabaseError(500, servicesError.message);
    }
  }

  const business = await getBusinessByIdForAdmin(data.id);
  if (!business) {
    throw createHttpError(500, "Bisnis berhasil dibuat tetapi gagal dibaca ulang.");
  }

  return business;
}

export async function updateBusinessRecord(id: number, payload: BusinessPayload) {
  const normalized = normalizePayload(payload);
  validateBusinessPayload(normalized);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("businesses")
    .update({
      template_id: normalized.templateId,
      slug: normalized.slug,
      name: normalized.name,
      tagline: normalized.tagline,
      description: normalized.description,
      hero_image: normalized.heroImage,
      hero_cta_label: normalized.heroCtaLabel,
      hero_cta_url: normalized.heroCtaUrl,
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

  const { error: deleteServicesError } = await supabase.from("services").delete().eq("business_id", id);
  if (deleteServicesError) {
    throwSupabaseError(500, deleteServicesError.message);
  }

  if (normalized.services.length > 0) {
    const { error: servicesError } = await supabase.from("services").insert(
      normalized.services.map((service, index) => ({
        business_id: id,
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

  return getBusinessByIdForAdmin(id);
}

export async function deleteBusinessRecord(id: number) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("businesses").delete().eq("id", id).select("id");

  if (error) {
    throwSupabaseError(500, error.message);
  }

  return Array.isArray(data) && data.length > 0;
}
