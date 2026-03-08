"use client";

import type { Business } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export async function saveBusiness(business: Business): Promise<Business> {
  const method = business.id ? "PUT" : "POST";
  const endpoint = business.id ? `/api/business/${business.id}` : "/api/business";
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(business),
  });

  if (!response.ok) {
    throw new Error("Failed to save business");
  }

  const payload = (await response.json()) as { data: Business };
  return payload.data;
}

export async function deleteBusinessById(id: number) {
  const response = await fetch(`${API_URL}/api/business/${id}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to delete business");
  }
}
