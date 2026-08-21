const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (
    options.body &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Request failed"
    );
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "GET",
    }),

  post: <T>(
    endpoint: string,
    body?: unknown
  ) =>
    request<T>(endpoint, {
      method: "POST",
      ...(body !== undefined
        ? {
            body:
              body instanceof FormData
                ? body
                : JSON.stringify(body),
          }
        : {}),
    }),

  put: <T>(
    endpoint: string,
    body?: unknown
  ) =>
    request<T>(endpoint, {
      method: "PUT",
      ...(body !== undefined
        ? {
            body:
              body instanceof FormData
                ? body
                : JSON.stringify(body),
          }
        : {}),
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown
  ) =>
    request<T>(endpoint, {
      method: "PATCH",
      ...(body !== undefined
        ? {
            body:
              body instanceof FormData
                ? body
                : JSON.stringify(body),
          }
        : {}),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
};