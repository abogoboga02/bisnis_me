"use client";

import type { Business } from "@/lib/types";

const API_BASE_PATH = "/api/business";

async function parseErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function saveBusiness(business: Business): Promise<Business> {
  const method = business.id ? "PUT" : "POST";
  const endpoint = business.id ? `${API_BASE_PATH}/${business.id}` : API_BASE_PATH;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(business),
    });
  } catch {
    throw new Error("Failed to reach the business API");
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to save business"));
  }

  const payload = (await response.json()) as { data: Business };
  return payload.data;
}

export async function deleteBusinessById(id: number) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_PATH}/${id}`, {
      method: "DELETE",
    });
  } catch {
    throw new Error("Failed to reach the business API");
  }

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response, "Failed to delete business"));
  }
}
