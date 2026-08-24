export const API_BASE_URL = "/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");

    return text
      ? { message: text }
      : { message: `Request failed with status ${response.status}` };
  }

  return response.json().catch(() => ({}));
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const errorData = data as {
      message?: string;
      error?: string;
    };

    throw new Error(
      errorData.message ||
        errorData.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "GET",
    }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      ...(body !== undefined
        ? {
            body:
              typeof FormData !== "undefined" && body instanceof FormData
                ? body
                : JSON.stringify(body),
          }
        : {}),
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      ...(body !== undefined
        ? {
            body:
              typeof FormData !== "undefined" && body instanceof FormData
                ? body
                : JSON.stringify(body),
          }
        : {}),
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      ...(body !== undefined
        ? {
            body:
              typeof FormData !== "undefined" && body instanceof FormData
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