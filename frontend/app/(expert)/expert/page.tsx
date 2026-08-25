"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GraduationCap,
  Layers,
  Users,
  CalendarClock,
  Eye,
  Star,
  Newspaper,
  Film,
  FolderOpen,
  ArrowRight,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

import {
  listMyEntrepreneurs,
  type EntrepreneurSummary,
} from "@/lib/api/entrepreneurs";
import { listMyMeetings, type Meeting } from "@/lib/api/meetings";


const API_BASE = "/api";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ContentItem = {
  id: string;
  views?: number | null;
};

type ResourceItem = {
  id: string;
};

type Course = {
  id: string;
  title: string;
  isPublished?: boolean;
  rating?: number | null;
  articles?: ContentItem[];
  videos?: ContentItem[];
  resources?: ResourceItem[];
};

type ApiResponse = {
  success?: boolean;
  data?: unknown;
  courses?: unknown;
  message?: string;
  error?: string;
};

type MeResponse = {
  success?: boolean;
  data?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  user?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  message?: string;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function safeLength(items?: unknown): number {
  return Array.isArray(items) ? items.length : 0;
}

function sumViews(items?: ContentItem[]): number {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((sum, item) => {
    const views = Number(item?.views ?? 0);

    return sum + (Number.isFinite(views) ? views : 0);
  }, 0);
}

function formatDateTime(iso?: string | null): string {
  if (!iso) {
    return "Date inconnue";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeCourses(data: unknown): Course[] {
  if (Array.isArray(data)) {
    return data as Course[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const response = data as ApiResponse;

  if (Array.isArray(response.data)) {
    return response.data as Course[];
  }

  if (Array.isArray(response.courses)) {
    return response.courses as Course[];
  }

  return [];
}

function getApiMessage(
  data: ApiResponse | MeResponse | null,
  fallback: string
): string {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  return fallback;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getHttpErrorMessage(
  response: Response,
  data: ApiResponse | MeResponse | null,
  fallback: string
): string {
  if (response.status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }

  if (response.status === 403) {
    return "Vous n'avez pas l'autorisation d'accéder à cette ressource.";
  }

  if (response.status === 404) {
    return "La ressource demandée est introuvable. Vérifiez la configuration de l'API.";
  }

  if (response.status >= 500) {
    return "Le serveur a rencontré une erreur. Veuillez réessayer.";
  }

  return getApiMessage(data, fallback);
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ExpertOverviewPage() {
  const [name, setName] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);

  const [entrepreneurs, setEntrepreneurs] = useState<
    EntrepreneurSummary[]
  >([]);

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Load dashboard                                                          */
  /* ---------------------------------------------------------------------- */

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        meRes,
        coursesRes,
        entrepreneursResult,
        meetingsResult,
      ] = await Promise.all([
        fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }),

        fetch(`${API_BASE}/courses/expert`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }),

        listMyEntrepreneurs(),

        listMyMeetings(),
      ]);

      /* ------------------------------------------------------------------ */
      /* Current expert                                                      */
      /* ------------------------------------------------------------------ */

      const meData = await parseJsonResponse<MeResponse>(meRes);

      if (!meRes.ok) {
        throw new Error(
          getHttpErrorMessage(
            meRes,
            meData,
            "Impossible de récupérer votre profil."
          )
        );
      }

      const currentUser = meData?.data ?? meData?.user;

      if (currentUser) {
        const fullName =
          currentUser.name?.trim() ||
          [currentUser.firstName, currentUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

        setName(fullName || null);
      } else {
        setName(null);
      }

      /* ------------------------------------------------------------------ */
      /* Courses                                                              */
      /* ------------------------------------------------------------------ */

      const coursesDataJson =
        await parseJsonResponse<ApiResponse>(coursesRes);

      if (!coursesRes.ok) {
        throw new Error(
          getHttpErrorMessage(
            coursesRes,
            coursesDataJson,
            "Impossible de charger les cours."
          )
        );
      }

      const normalizedCourses = normalizeCourses(coursesDataJson);

      setCourses(normalizedCourses);

      /* ------------------------------------------------------------------ */
      /* Entrepreneurs                                                       */
      /* ------------------------------------------------------------------ */

      setEntrepreneurs(
        Array.isArray(entrepreneursResult)
          ? entrepreneursResult
          : []
      );

      /* ------------------------------------------------------------------ */
      /* Meetings                                                             */
      /* ------------------------------------------------------------------ */

      setMeetings(
        Array.isArray(meetingsResult)
          ? meetingsResult
          : []
      );
    } catch (err) {
      console.error("Error loading expert dashboard:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger votre tableau de bord."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /* ---------------------------------------------------------------------- */
  /* Derived data                                                            */
  /* ---------------------------------------------------------------------- */

  const totals = useMemo(() => {
    const articles = courses.reduce(
      (sum, course) => sum + safeLength(course.articles),
      0
    );

    const videos = courses.reduce(
      (sum, course) => sum + safeLength(course.videos),
      0
    );

    const resources = courses.reduce(
      (sum, course) => sum + safeLength(course.resources),
      0
    );

    const views = courses.reduce(
      (sum, course) =>
        sum +
        sumViews(course.articles) +
        sumViews(course.videos),
      0
    );

    const publishedCourses = courses.filter(
      (course) => course.isPublished === true
    ).length;

    const ratedCourses = courses.filter(
      (course) => Number(course.rating ?? 0) > 0
    );

    const avgRating =
      ratedCourses.length > 0
        ? ratedCourses.reduce(
            (sum, course) =>
              sum + Number(course.rating ?? 0),
            0
          ) / ratedCourses.length
        : 0;

    return {
      courses: courses.length,
      publishedCourses,
      articles,
      videos,
      resources,
      content: articles + videos + resources,
      views,
      avgRating,
    };
  }, [courses]);

  const upcomingMeetings = useMemo(() => {
    const now = Date.now();

    return meetings
      .filter((meeting) => {
        if (!meeting?.scheduledAt) {
          return false;
        }

        const timestamp = new Date(
          meeting.scheduledAt
        ).getTime();

        return (
          !Number.isNaN(timestamp) &&
          timestamp >= now
        );
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime()
      );
  }, [meetings]);

  /* ---------------------------------------------------------------------- */
  /* Loading state                                                           */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-sand-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <Loader2
              size={18}
              className="animate-spin text-wine-700"
            />

            Chargement de votre tableau de bord...
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card-surface space-y-3 p-5"
              >
                <div className="h-11 w-11 animate-shimmer rounded-xl bg-gradient-to-r from-sand-100 via-sand-50 to-sand-100 bg-[length:200%_100%]" />

                <div className="h-3 w-20 animate-shimmer rounded bg-gradient-to-r from-sand-100 via-sand-50 to-sand-100 bg-[length:200%_100%]" />

                <div className="h-6 w-14 animate-shimmer rounded bg-gradient-to-r from-sand-100 via-sand-50 to-sand-100 bg-[length:200%_100%]" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Error state                                                             */
  /* ---------------------------------------------------------------------- */

  if (error) {
    return (
      <main className="min-h-screen bg-sand-50 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-xl2 border border-sand-200 bg-white px-6 py-14 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={26} />
          </div>

          <h2 className="font-display text-xl font-semibold text-wine-900">
            Impossible de charger votre tableau de bord
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadDashboard();
            }}
            className="focus-ring mt-6 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-wine-700"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Page                                                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Experte</span>

          <span className="mx-2 text-ink-soft/40">
            /
          </span>

          <span className="font-medium text-wine-700">
            Tableau de bord
          </span>
        </div>

        {/* Header */}
        <div className="relative mb-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Bonjour,
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            <span className="text-gradient-rise">
              {name || "bienvenue"}
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Voici un aperçu de votre activité sur Ellevadz.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<GraduationCap size={20} />}
            label="Cours publiés"
            value={`${totals.publishedCourses}/${totals.courses}`}
            delay={0}
          />

          <StatCard
            icon={<Layers size={20} />}
            label="Contenu total"
            value={totals.content}
            delay={40}
          />

          <StatCard
            icon={<Users size={20} />}
            label="Entrepreneures"
            value={entrepreneurs.length}
            delay={80}
          />

          <StatCard
            icon={<CalendarClock size={20} />}
            label="Réunions à venir"
            value={upcomingMeetings.length}
            delay={120}
          />

          <StatCard
            icon={<Eye size={20} />}
            label="Vues totales"
            value={totals.views}
            delay={160}
          />

          <StatCard
            icon={<Star size={20} />}
            label="Note moyenne"
            value={
              totals.avgRating > 0
                ? `${totals.avgRating.toFixed(1)} ★`
                : "—"
            }
            tone="gold"
            delay={200}
          />
        </div>

        {/* Meetings + content snapshot */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card-surface p-6 shadow-card lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-wine-900">
                  Réunions à venir
                </h2>

                <p className="text-xs text-ink-soft">
                  Vos prochains rendez-vous avec les entrepreneures
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/expert/meeting"
                  className="hidden items-center gap-1.5 text-sm font-semibold text-wine-700 transition hover:text-wine-900 sm:inline-flex"
                >
                  <Plus size={14} />
                  Planifier
                </Link>

                <Link
                  href="/expert/meeting"
                  className="text-sm font-semibold text-wine-700 transition hover:text-wine-900"
                >
                  Tout voir
                </Link>
              </div>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-6 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-ink-soft shadow-sm">
                  <CalendarClock size={22} />
                </div>

                <p className="max-w-xs text-sm text-ink-soft">
                  Aucune réunion à venir. Planifiez-en une pour retrouver vos
                  entrepreneures.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-sand-100">
                {upcomingMeetings
                  .slice(0, 4)
                  .map((meeting) => (
                    <li
                      key={meeting.id}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
                        <CalendarClock size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-wine-900">
                          {meeting.title}
                        </p>

                        <p className="truncate text-xs text-ink-soft">
                          {meeting.participants
                            ?.map(
                              (participant) =>
                                participant?.user?.name
                            )
                            .filter(Boolean)
                            .join(", ") ||
                            "Aucun participant"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-ink-soft">
                          {formatDateTime(
                            meeting.scheduledAt
                          )}
                        </p>

                        {meeting.meetingUrl && (
                          <a
                            href={meeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs font-semibold text-wine-700 hover:underline"
                          >
                            Rejoindre →
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="card-surface p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-wine-900">
              Aperçu du contenu
            </h2>

            <p className="mt-1 text-xs text-ink-soft">
              Ce que vous avez publié jusqu'ici
            </p>

            <div className="mt-5 space-y-3">
              <ContentRow
                icon={<Newspaper size={16} />}
                label="Articles"
                value={totals.articles}
              />

              <ContentRow
                icon={<Film size={16} />}
                label="Vidéos"
                value={totals.videos}
              />

              <ContentRow
                icon={<FolderOpen size={16} />}
                label="Ressources"
                value={totals.resources}
              />
            </div>

            <Link
              href="/expert/analytics"
              className="focus-ring mt-6 flex items-center justify-center gap-2 rounded-xl border border-wine-300 px-4 py-2.5 text-sm font-semibold text-wine-700 transition hover:-translate-y-0.5 hover:bg-wine-50"
            >
              Voir les statistiques complètes
              <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  tone = "default",
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: "default" | "gold";
  delay?: number;
}) {
  return (
    <div
      className="card-surface animate-rise p-5 shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-rose-200 hover:shadow-bloom"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
          tone === "gold"
            ? "bg-gold-400/15 text-gold-500"
            : "bg-rise-gradient-soft text-wine-700"
        }`}
      >
        {icon}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">
        {label}
      </p>

      <p className="mt-1 font-display text-2xl font-semibold text-wine-900">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Content row                                                                */
/* -------------------------------------------------------------------------- */

function ContentRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-sand-50 px-4 py-3">
      <span className="flex items-center gap-2.5 text-sm text-ink-soft">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-wine-700 shadow-sm">
          {icon}
        </span>

        {label}
      </span>

      <span className="font-display text-base font-semibold text-wine-900">
        {value}
      </span>
    </div>
  );
}