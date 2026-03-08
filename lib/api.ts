import { fallbackBusinesses, fallbackTemplates } from "@/lib/default-data";
import type { Business, Template } from "@/lib/types";

const API_URL = process.env.API_BASE_URL ?? "http://localhost:5000";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getBusinesses(): Promise<Business[]> {
  const payload = await fetchJson<{ data: Business[] }>("/api/businesses");
  return payload?.data ?? fallbackBusinesses;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const payload = await fetchJson<{ data: Business }>(`/api/business/${slug}`);
  return payload?.data ?? fallbackBusinesses.find((business) => business.slug === slug) ?? null;
}

export async function getTemplates(): Promise<Template[]> {
  const payload = await fetchJson<{ data: Template[] }>("/api/templates");
  return payload?.data ?? fallbackTemplates;
}
