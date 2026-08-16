// lib/api/admin.ts
import authService from "@/services/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

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
  chart: { month: string; value: number }[];
  roleDistribution: { label: string; count: number; pct: number }[];
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

export async function getAdminOverview(): Promise<AdminOverviewData> {
  const token = authService.getToken();

  const res = await fetch(`${API_URL}/admin/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load admin overview");
  }

  return json.data;
}