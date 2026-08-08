import authService from "@/services/auth";

export async function authFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = authService.getToken();

  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
}