const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data?.message || 'Une erreur est survenue');
  }

  return data;
}

export function getSettings() {
  return request('/settings/me');
}

export function saveSettings(data: unknown) {
  return request('/settings/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function getNotificationSettings() {
  return request('/settings/notifications');
}

export function saveNotificationSettings(data: Record<string, boolean>) {
  return request('/settings/notifications', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request('/settings/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function getAdminSettings() {
  return request('/settings/system');
}

export function saveAdminSettings(data: Array<{ key: string; value: unknown }>) {
  return request('/settings/system', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}