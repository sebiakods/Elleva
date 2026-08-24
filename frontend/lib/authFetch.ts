import { API_BASE_URL } from "@/services/api";

export async function authFetch(
  endpoint: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    init.body instanceof FormData;

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}