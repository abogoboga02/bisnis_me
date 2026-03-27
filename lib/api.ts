import type { Business, Template } from "@/lib/types";

const API_URL = process.env.API_BASE_URL ?? "http://localhost:5000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getBusinesses(): Promise<Business[]> {
  const payload = await fetchJson<{ data: Business[] }>("/api/businesses");
  return payload.data;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
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
  const payload = await fetchJson<{ data: Template[] }>("/api/templates");
  return payload.data;
}
