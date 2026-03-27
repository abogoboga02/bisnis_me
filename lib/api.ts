import { supabase } from "@/lib/supabase";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase-config";
import type { Business, Service, Template } from "@/lib/types";

const API_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

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

function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

async function fetchJson<T>(path: string): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "Read API tidak tersedia. Isi NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY atau API_BASE_URL.",
    );
  }

  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function mapTemplateRow(row: TemplateRow): Template {
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    description: row.description ?? "",
    accent: row.accent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

function mapBusinessRow(
  row: BusinessRow,
  services: ServiceRow[],
  template: TemplateRow | null = null,
): Business {
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

function assertSupabaseResult<T>(data: T, error: { message: string } | null, context: string): T {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }

  return data;
}

function logReadError(context: string, error: unknown) {
  console.error(`[data-read] ${context}`, error);
}

async function getTemplatesFromSupabase(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("id, name, key, description, accent, created_at, updated_at")
    .order("id", { ascending: true });

  const rows = assertSupabaseResult(data, error, "Supabase templates query failed") ?? [];
  return rows.map((row) => mapTemplateRow(row as TemplateRow));
}

async function getBusinessesFromSupabase(): Promise<Business[]> {
  const [{ data: businessData, error: businessError }, { data: serviceData, error: serviceError }, { data: templateData, error: templateError }] =
    await Promise.all([
      supabase
        .from("businesses")
        .select(
          "id, slug, name, tagline, description, hero_image, hero_cta_label, hero_cta_url, phone, whatsapp, address, meta_title, meta_description, og_image, template_id, created_at, updated_at",
        )
        .order("id", { ascending: true }),
      supabase
        .from("services")
        .select("id, business_id, name, description, icon, sort_order")
        .order("business_id", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("templates")
        .select("id, name, key, description, accent, created_at, updated_at")
        .order("id", { ascending: true }),
    ]);

  const businessRows = assertSupabaseResult(
    businessData,
    businessError,
    "Supabase businesses query failed",
  ) ?? [];
  const serviceRows = assertSupabaseResult(
    serviceData,
    serviceError,
    "Supabase services query failed",
  ) ?? [];
  const templateRows = assertSupabaseResult(
    templateData,
    templateError,
    "Supabase templates query failed",
  ) ?? [];

  const servicesByBusinessId = new Map<number, ServiceRow[]>();
  for (const service of serviceRows as ServiceRow[]) {
    const current = servicesByBusinessId.get(service.business_id) ?? [];
    current.push(service);
    servicesByBusinessId.set(service.business_id, current);
  }

  const templatesById = new Map<number, TemplateRow>();
  for (const template of templateRows as TemplateRow[]) {
    templatesById.set(template.id, template);
  }

  return (businessRows as BusinessRow[]).map((row) =>
    mapBusinessRow(row, servicesByBusinessId.get(row.id) ?? [], templatesById.get(row.template_id ?? -1) ?? null),
  );
}

async function getBusinessBySlugFromSupabase(slug: string): Promise<Business | null> {
  const { data: businessRow, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id, slug, name, tagline, description, hero_image, hero_cta_label, hero_cta_url, phone, whatsapp, address, meta_title, meta_description, og_image, template_id, created_at, updated_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (businessError) {
    throw new Error(`Supabase business query failed: ${businessError.message}`);
  }

  if (!businessRow) {
    return null;
  }

  const [{ data: serviceData, error: serviceError }, templateResult] = await Promise.all([
    supabase
      .from("services")
      .select("id, business_id, name, description, icon, sort_order")
      .eq("business_id", businessRow.id)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
    businessRow.template_id
      ? supabase
          .from("templates")
          .select("id, name, key, description, accent, created_at, updated_at")
          .eq("id", businessRow.template_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const serviceRows = assertSupabaseResult(
    serviceData,
    serviceError,
    "Supabase services query failed",
  ) ?? [];
  const templateRow = assertSupabaseResult(
    templateResult.data,
    templateResult.error,
    "Supabase template query failed",
  );

  return mapBusinessRow(
    businessRow as BusinessRow,
    serviceRows as ServiceRow[],
    (templateRow as TemplateRow | null) ?? null,
  );
}

export async function getBusinesses(): Promise<Business[]> {
  if (hasSupabaseConfig()) {
    try {
      return await getBusinessesFromSupabase();
    } catch (error) {
      logReadError("getBusinessesFromSupabase", error);
      return [];
    }
  }

  const payload = await fetchJson<{ data: Business[] }>("/api/businesses");
  return payload.data;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  if (hasSupabaseConfig()) {
    try {
      return await getBusinessBySlugFromSupabase(slug);
    } catch (error) {
      logReadError(`getBusinessBySlugFromSupabase:${slug}`, error);
      return null;
    }
  }

  try {
    const payload = await fetchJson<{ data: Business }>(`/api/business/${slug}`);
    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }

    throw error;
  }
}

export async function getTemplates(): Promise<Template[]> {
  if (hasSupabaseConfig()) {
    try {
      return await getTemplatesFromSupabase();
    } catch (error) {
      logReadError("getTemplatesFromSupabase", error);
      return [];
    }
  }

  const payload = await fetchJson<{ data: Template[] }>("/api/templates");
  return payload.data;
}
