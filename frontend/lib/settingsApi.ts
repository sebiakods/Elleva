import { API_BASE_URL as API_URL } from "@/services/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },

    // Send HttpOnly authentication cookies automatically
    credentials: "include",

    cache: "no-store",
  });

  const text = await response.text();

  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message || "Une erreur est survenue"
    );
  }

  return data;
}

export function getSettings() {
  return request("/settings/me");
}

export function saveSettings(data: unknown) {
  return request("/settings/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getNotificationSettings() {
  return request("/settings/notifications");
}

export function saveNotificationSettings(
  data: Record<string, boolean>
) {
  return request("/settings/notifications", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function changePassword(
  currentPassword: string,
  newPassword: string
) {
  return request("/settings/password", {
    method: "PUT",
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
}

export function getAdminSettings() {
  return request("/settings/system");
}

export function saveAdminSettings(
  data: Array<{ key: string; value: unknown }>
) {
  return request("/settings/system", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
