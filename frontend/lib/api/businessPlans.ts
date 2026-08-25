import { authFetch } from "@/lib/authFetch";

export type BusinessPlanStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type BusinessPlan = {
  id: string;
  title: string;
  status: BusinessPlanStatus;
  progress: number;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  executiveSummary?: Record<string, unknown> | null;
  marketAnalysis?: Record<string, unknown> | null;
  strategy?: Record<string, unknown> | null;
  financialPlan?: Record<string, unknown> | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewScore?: number | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function handle<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Erreur ${res.status}`);
  }

  return json.data;
}

// ─────────────────────────────────────────────────────────────
// Entrepreneur
// ─────────────────────────────────────────────────────────────

export async function listMyPlans(): Promise<BusinessPlan[]> {
  return handle(await authFetch("/business-plans"));
}

export async function getPlan(id: string): Promise<BusinessPlan> {
  return handle(await authFetch(`/business-plans/${id}`));
}

export async function createPlan(title: string): Promise<BusinessPlan> {
  return handle(
    await authFetch("/business-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
  );
}

export async function updatePlan(
  id: string,
  data: Partial<
    Pick<
      BusinessPlan,
      | "title"
      | "progress"
      | "executiveSummary"
      | "marketAnalysis"
      | "strategy"
      | "financialPlan"
    >
  >
): Promise<BusinessPlan> {
  return handle(
    await authFetch(`/business-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  );
}

export async function submitPlan(id: string): Promise<BusinessPlan> {
  return handle(
    await authFetch(`/business-plans/${id}/submit`, {
      method: "POST",
    })
  );
}

export async function deletePlan(id: string): Promise<void> {
  const res = await authFetch(`/business-plans/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `Erreur ${res.status}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Expert / Admin
// ─────────────────────────────────────────────────────────────

export async function listSubmittedPlans(
  view: "pending" | "completed" = "pending",
  page = 1,
  limit = 20
): Promise<{ items: BusinessPlan[]; total: number }> {
  const raw = await handle<any>(
    await authFetch(
      `/business-plans/review/queue?view=${view}&page=${page}&limit=${limit}`
    )
  );

  const items = Array.isArray(raw)
    ? raw
    : (raw.items ?? raw.data ?? []);

  const total = raw.total ?? items.length;

  return {
    items,
    total,
  };
}

export async function reviewPlan(
  id: string,
  data: {
    score: number;
    notes: string;
    status: "APPROVED" | "REJECTED";
  }
): Promise<BusinessPlan> {
  return handle(
    await authFetch(`/business-plans/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  );
}