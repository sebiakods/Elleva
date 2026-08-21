const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api"
).replace(/\/+$/, "");

export interface AdminOverviewData {
  analytics: {
    activeUsers: number;
    publishedPrograms: number;
    submittedBusinessPlans: number;
    completionRate: number;
  };

  quickActivity: {
    newSignups: number;
    pendingRequests: number;
    publishedContent: number;
    actionsRequired: number;
  };

  chart: {
    month: string;
    value: number;
  }[];

  roleDistribution: {
    label: string;
    count: number;
    pct: number;
  }[];

  totalUsers: number;

  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    createdAt: string;
  }[];
}

/**
 * Get admin dashboard overview.
 *
 * Authentication is handled by the HttpOnly session cookie.
 *
 * We intentionally DO NOT:
 * - read localStorage
 * - read sessionStorage
 * - read accessToken
 * - read refreshToken
 * - use authService.getToken()
 * - send Authorization: Bearer
 *
 * The browser automatically sends the authentication cookie
 * because credentials: "include" is enabled.
 */
export async function getAdminOverview(): Promise<AdminOverviewData> {
  const response = await fetch(
    `${API_URL}/admin/overview`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      cache: "no-store",
    }
  );

  const text = await response.text();

  let json: {
    success?: boolean;
    data?: AdminOverviewData;
    message?: string;
    error?: string;
  } = {};

  try {
    json = text
      ? JSON.parse(text)
      : {};
  } catch {
    throw new Error(
      "Réponse invalide du serveur."
    );
  }

  if (!response.ok) {
    throw new Error(
      json.message ||
        json.error ||
        `Erreur serveur (${response.status}).`
    );
  }

  if (!json.success) {
    throw new Error(
      json.message ||
        "Impossible de charger les statistiques administrateur."
    );
  }

  if (!json.data) {
    throw new Error(
      "Les données administrateur sont introuvables."
    );
  }

  return json.data;
}
