/**
 * Centralized HTTP Client.
 * Reads VITE_API_URL at build-time to resolve full API base URL.
 *
 * Behavior:
 * - If import.meta.env.VITE_API_URL is set, it will be used as the base for relative paths.
 * - In development (MODE === 'development'), if VITE_API_URL is not present, client falls back to http://localhost:3000/api
 *   so local dev with `npm run dev` (server.ts running on 3000) continues to work.
 * - In production if VITE_API_URL is NOT set, the client will use same-origin relative paths (so /api/* will work when
 *   the backend is proxied on the same domain via Netlify Functions + redirects).
 *
 * The rest of the original behavior (auth header injection, retry, JSON handling) is preserved.
 */

import { User } from "../../types";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  retry?: number;
  retryDelay?: number;
  body?: unknown;
}

export class APIError extends Error {
  status: number;
  errorBody: unknown;

  constructor(message: string, status: number, errorBody?: unknown) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.errorBody = errorBody;
  }
}

export function getAuthHeaders(user?: User | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (user) {
    if (user.role) headers["x-user-role"] = user.role;
    if (user.id) headers["x-user-id"] = user.id;
    if (user.username) headers["x-username"] = user.username;
    headers["x-user-username"] = user.username;
  }
  return headers;
}

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;
const MODE = (import.meta as any).env?.MODE as string | undefined || "development";

// Determine base URL
let BASE_URL: string | undefined = undefined;
if (VITE_API_URL && typeof VITE_API_URL === "string" && VITE_API_URL.trim() !== "") {
  BASE_URL = VITE_API_URL.replace(/\/$/, ""); // remove trailing slash
} else if (MODE === "development") {
  // Local dev fallback to integrated server (server.ts listens on port 3000 and exposes /api/*)
  BASE_URL = "http://localhost:3000/api";
} else {
  // Production and VITE_API_URL not provided: use same-origin relative paths (so '/api/...' remains on same host)
  BASE_URL = "";
}

/**
 * Build final absolute URL for a request.
 * - If url already has a full scheme (http/https), use it unchanged.
 * - Otherwise, combine BASE_URL and url ensuring single slash.
 */
function buildUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  // ensure url starts with a single slash
  const relative = url.startsWith("/") ? url : `/${url}`;
  if (BASE_URL === undefined) {
    return relative;
  }
  if (BASE_URL === "") {
    // same-origin
    return relative;
  }
  return `${BASE_URL}${relative}`;
}

/**
 * Centralized fetch client with automatic headers injection, JSON serialization,
 * retry on transient errors, and response normalization.
 */
export async function httpClient<T>(
  url: string,
  options: RequestOptions = {},
  user?: User | null
): Promise<T> {
  const { retry = 2, retryDelay = 1000, ...fetchOptions } = options;

  // Setup headers
  const authHeaders = getAuthHeaders(user);
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeaders,
  };

  const finalHeaders = new Headers({
    ...defaultHeaders,
    ...(fetchOptions.headers as Record<string, string> || {}),
  });

  // If body is an object and not FormData, stringify it
  let body = fetchOptions.body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    body = JSON.stringify(body);
  }

  const finalUrl = buildUrl(url);

  const executeCall = async (attempt: number): Promise<T> => {
    try {
      const response = await fetch(finalUrl, {
        ...fetchOptions,
        headers: finalHeaders,
        body: body as BodyInit | null | undefined,
      });

      if (!response.ok) {
        // If it's a transient server error (5xx) and we have retries left
        if (response.status >= 500 && attempt < retry) {
          console.warn(`[HTTP Client] Request failed with ${response.status}. Retrying in ${retryDelay}ms... (Attempt ${attempt + 1}/${retry + 1})`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return executeCall(attempt + 1);
        }

        let bodyJson: Record<string, unknown> | null = null;
        try {
          bodyJson = (await response.json()) as Record<string, unknown>;
        } catch {
          bodyJson = { error: response.statusText };
        }

        const errMsg =
          bodyJson && typeof bodyJson === "object" && "error" in bodyJson && typeof (bodyJson as any).error === "string"
            ? (bodyJson as any).error
            : `HTTP ${response.status}: ${response.statusText}`;

        throw new APIError(errMsg, response.status, bodyJson);
      }

      // Return parsed JSON
      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      // Handle network errors and retry
      if (attempt < retry) {
        console.warn(`[HTTP Client] Network error occurred. Retrying... (Attempt ${attempt + 1}/${retry + 1})`, err);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return executeCall(attempt + 1);
      }

      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan atau koneksi ditolak";
      throw new APIError(errMsg, 0);
    }
  };

  return executeCall(0);
}
