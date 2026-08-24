import { authFetch } from "@/lib/authFetch";

import { API_BASE_URL as API_URL } from "@/services/api";

export type EntrepreneurSummary = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  businessPlans: { id: string; title: string; status: string; reviewScore: number | null; updatedAt: string }[];
  sessions: { id: string; topic: string; status: string; scheduledAt: string }[];
  lastActivity: string;
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function listMyEntrepreneurs(): Promise<EntrepreneurSummary[]> {
  const res = await authFetch(`${API_URL}/expert/entrepreneurs`);
  const json = (await res.json().catch(() => null)) as ApiResponse<EntrepreneurSummary[]> | null;
  if (!res.ok || !json?.success) throw new Error(json?.message || `Erreur ${res.status}`);
  return json.data;
}
