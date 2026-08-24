import { authFetch } from "@/lib/authFetch";

import { API_BASE_URL as API_URL } from "@/services/api";

export type QAUser = { id: string; name: string; avatarUrl: string | null };

export type QAQuestion = {
  id: string;
  question: string;
  answer: string | null;
  category: string;
  votes: number;
  isAnswered: boolean;
  answeredAt: string | null;
  createdAt: string;
  asker?: QAUser;
  answerer?: QAUser | null;
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

async function handle<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !json?.success) throw new Error(json?.message || `Erreur ${res.status}`);
  return json.data;
}

// ── Entrepreneur ────────────────────────────────────────────────────────────
export async function askQuestion(question: string, category: string): Promise<QAQuestion> {
  return handle(
    await authFetch(`${API_URL}/qa`, {
      method: "POST",
      body: JSON.stringify({ question, category }),
    })
  );
}

export async function listMyQuestions(): Promise<QAQuestion[]> {
  return handle(await authFetch(`${API_URL}/qa/mine`));
}

// ── Expert / Admin ──────────────────────────────────────────────────────────
export async function listAllQuestions(answered?: boolean, search?: string): Promise<QAQuestion[]> {
  const params = new URLSearchParams();
  if (answered !== undefined) params.set("answered", String(answered));
  if (search) params.set("search", search);
  return handle(await authFetch(`${API_URL}/qa?${params.toString()}`));
}

export async function answerQuestion(id: string, answer: string): Promise<QAQuestion> {
  return handle(
    await authFetch(`${API_URL}/qa/${id}/answer`, {
      method: "PATCH",
      body: JSON.stringify({ answer }),
    })
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────
export async function voteQuestion(id: string): Promise<QAQuestion> {
  return handle(await authFetch(`${API_URL}/qa/${id}/vote`, { method: "POST" }));
}
