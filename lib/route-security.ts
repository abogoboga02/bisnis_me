import "server-only";

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import type { AdminIdentity } from "@/lib/types";

type AppRouteError = Error & { status?: number };

type JsonResponseOptions = {
  status?: number;
  noStore?: boolean;
  cacheControl?: string;
};

type RateLimitOptions = {
  namespace: string;
  max: number;
  windowMs: number;
  identifier?: string | null;
  message?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_STORE_KEY = "__bisnis_me_rate_limit_store__";

function getRateLimitStore() {
  const globalStore = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_KEY]?: Map<string, RateLimitEntry>;
  };

  if (!globalStore[RATE_LIMIT_STORE_KEY]) {
    globalStore[RATE_LIMIT_STORE_KEY] = new Map<string, RateLimitEntry>();
  }

  return globalStore[RATE_LIMIT_STORE_KEY];
}

export function createRouteError(status: number, message: string) {
  const error = new Error(message) as AppRouteError;
  error.status = status;
  return error;
}

function addAllowedOrigin(allowedOrigins: Set<string>, candidate: string | null | undefined) {
  if (!candidate) {
    return;
  }

  try {
    allowedOrigins.add(new URL(candidate).origin);
  } catch {
    // Ignore invalid origin candidates.
  }
}

function getForwardedHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function getRequestHostOrigin(request: Request) {
  const forwardedHost = getForwardedHeaderValue(request.headers.get("x-forwarded-host"));
  const host = request.headers.get("host")?.trim() || null;
  const hostname = forwardedHost || host;

  if (!hostname) {
    return null;
  }

  const forwardedProto = getForwardedHeaderValue(request.headers.get("x-forwarded-proto"));

  try {
    const requestUrl = new URL(request.url);
    const protocol = (forwardedProto || requestUrl.protocol).replace(/:$/, "");
    return `${protocol}://${hostname}`;
  } catch {
    return null;
  }
}

function applyCommonHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

function applyNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Vary", "Cookie");
  return response;
}

export function jsonResponse(payload: unknown, options: JsonResponseOptions = {}) {
  const response = NextResponse.json(payload, {
    status: options.status ?? 200,
  });

  applyCommonHeaders(response);

  if (options.noStore) {
    applyNoStore(response);
  } else if (options.cacheControl) {
    response.headers.set("Cache-Control", options.cacheControl);
  }

  return response;
}

export function handleRouteError(error: unknown, fallbackMessage: string) {
  if (error instanceof SyntaxError) {
    return jsonResponse({ error: "Payload JSON tidak valid." }, { status: 400, noStore: true });
  }

  const appError = error as AppRouteError;
  return jsonResponse(
    { error: appError.message || fallbackMessage },
    { status: appError.status ?? 500, noStore: true },
  );
}

function getAllowedOrigins(request: Request) {
  const allowedOrigins = new Set<string>();

  addAllowedOrigin(allowedOrigins, request.url);

  // Prefer the public-facing host so LAN and reverse-proxy access still passes origin checks.
  addAllowedOrigin(allowedOrigins, getRequestHostOrigin(request));

  for (const candidate of [process.env.NEXT_PUBLIC_SITE_URL, process.env.APP_ORIGIN]) {
    addAllowedOrigin(allowedOrigins, candidate);
  }

  return allowedOrigins;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedOrigins(request);

  if (origin) {
    if (!allowedOrigins.has(origin)) {
      throw createRouteError(403, "Origin request tidak diizinkan.");
    }

    return;
  }

  if (!referer) {
    return;
  }

  try {
    const refererOrigin = new URL(referer).origin;
    if (!allowedOrigins.has(refererOrigin)) {
      throw createRouteError(403, "Referer request tidak diizinkan.");
    }
  } catch {
    throw createRouteError(403, "Referer request tidak valid.");
  }
}

export function assertJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw createRouteError(415, "Content-Type wajib application/json.");
  }
}

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "local";
}

export function assertRateLimit(request: Request, options: RateLimitOptions) {
  const store = getRateLimitStore();
  const now = Date.now();

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }

  const identifier = options.identifier?.trim() || getClientIdentifier(request);
  const key = `${options.namespace}:${identifier}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (current.count >= options.max) {
    throw createRouteError(
      429,
      options.message || "Terlalu banyak percobaan dari koneksi ini. Coba lagi beberapa saat lagi.",
    );
  }

  current.count += 1;
  store.set(key, current);
}

export async function requireAdminApiSession(): Promise<AdminIdentity> {
  const session = await getAdminSession();

  if (!session) {
    throw createRouteError(401, "Unauthorized.");
  }

  return session;
}
