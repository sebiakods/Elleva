"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  Newspaper,
  FolderOpen,
  Users,
  CalendarClock,
  GraduationCap,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  listMyEntrepreneurs,
  type EntrepreneurSummary,
} from "@/lib/api/entrepreneurs";

import {
  listMyMeetings,
  type Meeting,
} from "@/lib/api/meetings";

import { API_BASE_URL as API_URL } from "@/services/api";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CourseContentItem = {
  id: string;
};

type Course = {
  id: string;
  title: string;
  isPublished: boolean;
  articles: CourseContentItem[];
  videos: CourseContentItem[];
  resources: CourseContentItem[];
};

/* -------------------------------------------------------------------------- */
/* Palette                                                                    */
/* -------------------------------------------------------------------------- */

const CHART_COLORS = {
  wine: "#6d2447",
  rose: "#fb7185",
  gold: "#eab308",
  grid: "#eee3d8",
  ink: "#8a7b80",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function safeLength(items?: unknown[]) {
  return Array.isArray(items) ? items.length : 0;
}

function truncate(text: string, max = 16) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function getLastMonths(count: number) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const label = date.toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    });

    months.push({
      key,
      label,
    });
  }

  return months;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ExpertAnalyticsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<
    EntrepreneurSummary[]
  >([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError(null);


      const [coursesRes, entrepreneursData, meetingsData] =
        await Promise.all([
          fetch(`${API_URL}/courses/expert`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }),

          listMyEntrepreneurs(),

          listMyMeetings(),
        ]);

      const coursesJson = await coursesRes
        .json()
        .catch(() => ({}));

      if (!coursesRes.ok) {
        if (coursesRes.status === 401) {
          throw new Error(
            "Votre session a expiré. Veuillez vous reconnecter."
          );
        }

        if (coursesRes.status === 403) {
          throw new Error(
            "Vous n'avez pas l'autorisation d'accéder à ces statistiques."
          );
        }

        throw new Error(
          coursesJson?.message ||
            "Impossible de charger les cours."
        );
      }

      const coursesData: Course[] = Array.isArray(
        coursesJson?.data
      )
        ? coursesJson.data
        : [];

      setCourses(coursesData);
      setEntrepreneurs(entrepreneursData);
      setMeetings(meetingsData);
    } catch (err) {
      console.error("Error loading analytics:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les statistiques."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Derived data                                                            */
  /* ---------------------------------------------------------------------- */

  const totals = useMemo(() => {
    const articles = courses.reduce(
      (sum, course) =>
        sum + safeLength(course.articles),
      0
    );

    const videos = courses.reduce(
      (sum, course) =>
        sum + safeLength(course.videos),
      0
    );

    const resources = courses.reduce(
      (sum, course) =>
        sum + safeLength(course.resources),
      0
    );

    return {
      courses: courses.length,
      publishedCourses: courses.filter(
        (course) => course.isPublished
      ).length,
      articles,
      videos,
      resources,
      content: articles + videos + resources,
    };
  }, [courses]);

  const contentBreakdown = useMemo(
    () => [
      {
        name: "Articles",
        value: totals.articles,
        color: CHART_COLORS.wine,
      },
      {
        name: "Vidéos",
        value: totals.videos,
        color: CHART_COLORS.rose,
      },
      {
        name: "Ressources",
        value: totals.resources,
        color: CHART_COLORS.gold,
      },
    ],
    [totals]
  );

  const hasContent = totals.content > 0;

  const perCourseData = useMemo(
    () =>
      courses
        .slice()
        .sort((a, b) => {
          const aTotal =
            safeLength(a.articles) +
            safeLength(a.videos) +
            safeLength(a.resources);

          const bTotal =
            safeLength(b.articles) +
            safeLength(b.videos) +
            safeLength(b.resources);

          return bTotal - aTotal;
        })
        .slice(0, 8)
        .map((course) => ({
          name: truncate(course.title),
          fullName: course.title,
          Articles: safeLength(course.articles),
          Vidéos: safeLength(course.videos),
          Ressources: safeLength(course.resources),
        })),
    [courses]
  );

  const monthlyMeetings = useMemo(() => {
    const months = getLastMonths(6);

    return months.map(({ key, label }) => {
      const count = meetings.filter((meeting) => {
        const date = new Date(meeting.scheduledAt);

        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        return monthKey === key;
      }).length;

      return {
        month: label,
        Réunions: count,
      };
    });
  }, [meetings]);

  const upcomingMeetings = useMemo(
    () =>
      meetings.filter(
        (meeting) =>
          new Date(meeting.scheduledAt) >= new Date()
      ).length,
    [meetings]
  );

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

            Chargement de vos statistiques...
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
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
            Impossible de charger vos statistiques
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="focus-ring mt-6 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-wine-700"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Page                                                                     */
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
            Analytics
          </span>
        </div>

        {/* Header */}

        <div className="relative mb-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Vue d'ensemble
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Mes{" "}
            <span className="text-gradient-rise">
              statistiques
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Le contenu que vous publiez, les entrepreneures que
            vous accompagnez et l'activité de vos réunions, en un
            coup d'œil.
          </p>
        </div>

        {/* Stat cards */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Contenu total"
            value={totals.content}
            delay={0}
          />

          <StatCard
            icon={<GraduationCap size={20} />}
            label="Cours publiés"
            value={`${totals.publishedCourses}/${totals.courses}`}
            delay={70}
          />

          <StatCard
            icon={<Users size={20} />}
            label="Entrepreneures"
            value={entrepreneurs.length}
            delay={140}
          />

          <StatCard
            icon={<CalendarClock size={20} />}
            label="Réunions programmées"
            value={meetings.length}
            sublabel={`${upcomingMeetings} à venir`}
            delay={210}
          />
        </div>

        {/* Content breakdown */}

        <section className="mb-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Pie chart */}

          <div className="card-surface p-6 shadow-card">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
                <FolderOpen size={19} />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-wine-900">
                  Répartition du contenu
                </h2>

                <p className="text-xs text-ink-soft">
                  Articles, vidéos et ressources
                </p>
              </div>
            </div>

            {hasContent ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={contentBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {contentBreakdown.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            stroke="none"
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: `1px solid ${CHART_COLORS.grid}`,
                          fontSize: 13,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 space-y-2">
                  {contentBreakdown.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-ink-soft">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        {item.name}
                      </span>

                      <span className="font-semibold text-wine-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChartState
                icon={<FolderOpen size={22} />}
                text="Ajoutez des articles, vidéos ou ressources pour voir la répartition."
              />
            )}
          </div>

          {/* Per-course chart */}

          <div className="card-surface p-6 shadow-card">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
                <Newspaper size={19} />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-wine-900">
                  Contenu par cours
                </h2>

                <p className="text-xs text-ink-soft">
                  Nombre d'articles, vidéos et ressources par cours
                  (top 8)
                </p>
              </div>
            </div>

            {perCourseData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={perCourseData}
                    barGap={4}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke={CHART_COLORS.grid}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                        fill: CHART_COLORS.ink,
                      }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={55}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: CHART_COLORS.ink,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid ${CHART_COLORS.grid}`,
                        fontSize: 13,
                      }}
                      labelFormatter={(
                        _label,
                        payload
                      ) =>
                        payload?.[0]?.payload?.fullName ??
                        ""
                      }
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                      }}
                    />

                    <Bar
                      dataKey="Articles"
                      stackId="content"
                      fill={CHART_COLORS.wine}
                    />

                    <Bar
                      dataKey="Vidéos"
                      stackId="content"
                      fill={CHART_COLORS.rose}
                    />

                    <Bar
                      dataKey="Ressources"
                      stackId="content"
                      fill={CHART_COLORS.gold}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChartState
                icon={<GraduationCap size={22} />}
                text="Créez un cours et ajoutez du contenu pour voir ce graphique."
              />
            )}
          </div>
        </section>

        {/* Meetings activity */}

        <section className="card-surface p-6 shadow-card">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
                <CalendarClock size={19} />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-wine-900">
                  Activité des réunions
                </h2>

                <p className="text-xs text-ink-soft">
                  Réunions programmées par mois — 6 derniers mois
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-ink-soft/70">
                  Total
                </p>

                <p className="font-display text-lg font-semibold text-wine-900">
                  {meetings.length}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-ink-soft/70">
                  À venir
                </p>

                <p className="font-display text-lg font-semibold text-wine-900">
                  {upcomingMeetings}
                </p>
              </div>
            </div>
          </div>

          {meetings.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={monthlyMeetings}>
                  <CartesianGrid
                    vertical={false}
                    stroke={CHART_COLORS.grid}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: CHART_COLORS.ink,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                      fill: CHART_COLORS.ink,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: `1px solid ${CHART_COLORS.grid}`,
                      fontSize: 13,
                    }}
                  />

                  <Bar
                    dataKey="Réunions"
                    fill={CHART_COLORS.wine}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState
              icon={<CalendarClock size={22} />}
              text="Programmez une réunion pour voir l'activité apparaître ici."
            />
          )}
        </section>
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
  sublabel,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  delay?: number;
}) {
  return (
    <div
      className="card-surface animate-rise p-5 shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-rose-200 hover:shadow-bloom"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rise-gradient-soft text-wine-700">
        {icon}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-2">
        <p className="font-display text-2xl font-semibold text-wine-900">
          {value}
        </p>

        {sublabel && (
          <span className="text-xs text-ink-soft">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyChartState({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-6 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-ink-soft shadow-sm">
        {icon}
      </div>

      <p className="max-w-xs text-sm text-ink-soft">
        {text}
      </p>
    </div>
  );
}
