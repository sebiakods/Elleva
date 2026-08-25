import { authFetch } from "@/lib/authFetch";

export type EntrepreneurSummary = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;

  businessPlans: {
    id: string;
    title: string;
    status: string;
    reviewScore: number | null;
    updatedAt: string;
  }[];

  sessions: {
    id: string;
    topic: string;
    status: string;
    scheduledAt: string;
  }[];

  lastActivity: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function handle<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!res.ok || !json?.success) {
    throw new Error(
      json?.message || `Erreur ${res.status}`
    );
  }

  return json.data;
}

export async function listMyEntrepreneurs(): Promise<
  EntrepreneurSummary[]
> {
  const res = await authFetch(
    "/expert/entrepreneurs"
  );

  return handle<EntrepreneurSummary[]>(res);
}