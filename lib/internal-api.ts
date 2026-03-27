import "server-only";

export function getApiUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
}

export function getInternalApiKey() {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) {
    throw new Error("INTERNAL_API_KEY wajib diisi.");
  }

  return key;
}
