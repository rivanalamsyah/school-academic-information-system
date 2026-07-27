/**
 * Centralized HTTP Client.
 * Manages request headers, auth injection, retries, and error handling.
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

/**
 * Get authentication headers based on user session
 */
export function getAuthHeaders(user?: User | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (user) {
    if (user.role) headers["x-user-role"] = user.role;
    if (user.id) headers["x-user-id"] = user.id;
    if (user.username) headers["x-username"] = user.username;
    // For general compatibility:
    headers["x-user-username"] = user.username;
  }
  return headers;
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

  const executeCall = async (attempt: number): Promise<T> => {
    try {
      const response = await fetch(url, {
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
          bodyJson = await response.json() as Record<string, unknown>;
        } catch {
          bodyJson = { error: response.statusText };
        }

        const errMsg = bodyJson && typeof bodyJson === "object" && "error" in bodyJson && typeof bodyJson.error === "string"
          ? bodyJson.error
          : `HTTP ${response.status}: ${response.statusText}`;

        throw new APIError(
          errMsg,
          response.status,
          bodyJson
        );
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
