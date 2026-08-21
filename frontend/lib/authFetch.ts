import { api } from "@/services/api";

export async function authFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers =
    new Headers(init.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    init.body instanceof FormData;

  if (
    init.body &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}