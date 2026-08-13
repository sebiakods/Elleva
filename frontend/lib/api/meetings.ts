import { authFetch } from "@/lib/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type MeetingUser = { id: string; name: string; email: string; avatarUrl: string | null };

export type Meeting = {
  id: string;
  title: string;
  platform: string;
  meetingUrl: string;
  scheduledAt: string;
  notes: string | null;
  expert: { id: string; name: string; email?: string; avatarUrl: string | null };
  participants: { user: MeetingUser }[];
  createdAt: string;
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

async function handle<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Erreur ${res.status}`);
  }
  return json.data;
}

export async function createMeeting(data: {
  title: string;
  platform: string;
  meetingUrl: string;
  scheduledAt: string;
  notes?: string;
  participantIds: string[];
}): Promise<Meeting> {
  return handle(
    await authFetch(`${API_URL}/meetings`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  );
}

export async function listMyMeetings(): Promise<Meeting[]> {
  return handle(await authFetch(`${API_URL}/meetings`));
}

export async function getMeeting(id: string): Promise<Meeting> {
  return handle(await authFetch(`${API_URL}/meetings/${id}`));
}