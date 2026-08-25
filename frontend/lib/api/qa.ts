import { authFetch } from "@/lib/authFetch";

export type QAUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

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

/* ================================================================
   ENTREPRENEUR
   ================================================================ */

export async function askQuestion(
  question: string,
  category: string
): Promise<QAQuestion> {
  return handle(
    await authFetch("/qa", {
      method: "POST",
      body: JSON.stringify({
        question,
        category,
      }),
    })
  );
}

export async function listMyQuestions(): Promise<QAQuestion[]> {
  return handle(
    await authFetch("/qa/mine")
  );
}

/* ================================================================
   EXPERT / ADMIN
   ================================================================ */

export async function listAllQuestions(
  answered?: boolean,
  search?: string
): Promise<QAQuestion[]> {
  const params = new URLSearchParams();

  if (answered !== undefined) {
    params.set("answered", String(answered));
  }

  if (search) {
    params.set("search", search);
  }

  const query = params.toString();

  return handle(
    await authFetch(
      query ? `/qa?${query}` : "/qa"
    )
  );
}

export async function answerQuestion(
  id: string,
  answer: string
): Promise<QAQuestion> {
  return handle(
    await authFetch(`/qa/${id}/answer`, {
      method: "PATCH",
      body: JSON.stringify({
        answer,
      }),
    })
  );
}

/* ================================================================
   SHARED
   ================================================================ */

export async function voteQuestion(
  id: string
): Promise<QAQuestion> {
  return handle(
    await authFetch(`/qa/${id}/vote`, {
      method: "POST",
    })
  );
}