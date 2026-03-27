"use client";

import type { AdminIdentity, Business } from "@/lib/types";

const API_BASE_PATH = "/api/business";
const ADMIN_LOGIN_PATH = "/api/admin/login";
const ADMIN_LOGOUT_PATH = "/api/admin/logout";

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
      credentials: "same-origin",
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
      credentials: "same-origin",
    });
  } catch {
    throw new Error("Failed to reach the business API");
  }

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response, "Failed to delete business"));
  }
}

type AdminLoginPayload = {
  data: {
    admin: AdminIdentity;
  };
};

export async function loginAdmin(email: string, password: string) {
  let response: Response;
  try {
    response = await fetch(ADMIN_LOGIN_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });
  } catch {
    throw new Error("Failed to reach the admin login API");
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to sign in"));
  }

  const payload = (await response.json()) as AdminLoginPayload;
  return payload.data.admin;
}

export async function logoutAdmin() {
  let response: Response;
  try {
    response = await fetch(ADMIN_LOGOUT_PATH, {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    throw new Error("Failed to reach the admin logout API");
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to sign out"));
  }
}

export async function uploadAdminImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });
  } catch {
    throw new Error("Failed to reach the upload API");
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to upload image"));
  }

  const payload = (await response.json()) as {
    data: {
      path: string;
      fileName: string;
    };
  };

  return payload.data.path;
}
