"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Landmark,
  ClipboardList,
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
  Inbox,
  type LucideIcon,
} from "lucide-react";

import { StatsCards } from "@/components/dashboard/StatsCards";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";
import { Avatar } from "@/components/common/Avatar";

import { API_BASE_URL } from "@/services/api";

type BadgeTone = "wine" | "gold" | "rose" | "neutral";

type AppStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WAITLISTED";

interface OverviewData {
  stats: {
    activePrograms: number;
    totalApplications: number;
    upcomingEvents: number;
    totalBeneficiaries: number;
  };

  statusDistribution: {
    label: string;
    value: number;
    tone: BadgeTone;
  }[];

  recentApplications: {
    id: string;
    applicantName: string;
    applicantAvatarUrl: string | null;
    programTitle: string;
    status: AppStatus;
    createdAt: string;
  }[];
}

const statusMap: Record<
  AppStatus,
  {
    label: string;
    tone: BadgeTone;
  }
> = {
  SUBMITTED: {
    label: "Reçue",
    tone: "wine",
  },

  UNDER_REVIEW: {
    label: "En révision",
    tone: "gold",
  },

  APPROVED: {
    label: "Approuvée",
    tone: "rose",
  },

  REJECTED: {
    label: "Refusée",
    tone: "neutral",
  },

  WAITLISTED: {
    label: "Liste d'attente",
    tone: "gold",
  },
};

function formatRelativeFr(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();

  const diffMin = Math.floor(
    diffMs / 60_000
  );

  const diffHours = Math.floor(
    diffMin / 60
  );

  const diffDays = Math.floor(
    diffHours / 24
  );

  if (diffMin < 1) {
    return "À l'instant";
  }

  if (diffMin < 60) {
    return `Il y a ${diffMin} min`;
  }

  if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  }

  if (diffDays === 1) {
    return "Hier";
  }

  if (diffDays < 7) {
    return `Il y a ${diffDays}j`;
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
    }
  );
}

async function fetchInstitutionOverview(): Promise<OverviewData> {
  const res = await fetch(
    `${API_BASE_URL}/institution/overview`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => null);

    throw new Error(
      body?.message ??
        "Impossible de charger le tableau de bord"
    );
  }

  const json = await res.json();

  return json.data as OverviewData;
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-sand-100 bg-sand-100/40 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm">
        <Icon size={18} />
      </div>

      <p className="max-w-[220px] text-sm text-ink-soft">
        {message}
      </p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="card-surface flex items-center gap-3 p-5 shadow-card">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-sand-100" />

      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-sand-100" />

        <div className="h-6 w-12 animate-pulse rounded bg-sand-100" />
      </div>
    </div>
  );
}

function RecentApplicationsSkeleton() {
  return (
    <ul className="divide-y divide-sand-100">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-3 py-3"
        >
          <div className="h-8 w-8 animate-pulse rounded-full bg-sand-100" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-sand-100" />

            <div className="h-2.5 w-20 animate-pulse rounded bg-sand-100" />
          </div>

          <div className="h-5 w-16 animate-pulse rounded-full bg-sand-100" />
        </li>
      ))}
    </ul>
  );
}

function DistributionSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 animate-pulse rounded-full bg-sand-100" />

            <div className="h-3 w-8 animate-pulse rounded bg-sand-100" />
          </div>

          <div className="h-2 w-full animate-pulse rounded-full bg-sand-100" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function InstitutionOverviewPage() {
  const [data, setData] =
    useState<OverviewData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const overview =
        await fetchInstitutionOverview();

      setData(overview);
    } catch (err) {
      console.error(
        "Institution overview error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats =
    data?.stats ?? {
      activePrograms: 0,
      totalApplications: 0,
      upcomingEvents: 0,
      totalBeneficiaries: 0,
    };

  const recentApplications =
    data?.recentApplications ?? [];

  const statusDistribution =
    data?.statusDistribution ?? [];

  const isInitialLoading =
    isLoading && !data;

  return (
    <>
      {/* Breadcrumb */}

      <div className="mb-8 text-sm text-ink-soft">
        <span>Espace Institution</span>

        <span className="mx-2 text-ink-soft/40">
          /
        </span>

        <span className="font-medium text-wine-700">
          Aperçu
        </span>
      </div>

      {/* Header Section */}

      <div className="relative mb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <p className="font-script text-2xl leading-none text-rose-500">
          Vue d&apos;ensemble
        </p>

        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          Tableau de bord -{" "}
          <span className="text-gradient-rise">
            Aperçu
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Consultez l&apos;activité globale de votre
          institution, suivez l&apos;évolution des
          candidatures et gardez un œil sur vos
          programmes actifs et bénéficiaires.
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="shrink-0"
            />

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={load}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <RefreshCw size={14} />

            Réessayer
          </button>
        </div>
      )}

      {/* Stats */}

      {isInitialLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <Reveal>
          <StatsCards
            items={[
              {
                label: "Programmes actifs",
                value:
                  stats.activePrograms.toLocaleString(
                    "fr-FR"
                  ),
                icon: Landmark,
                tone: "rose",
              },

              {
                label: "Candidatures reçues",
                value:
                  stats.totalApplications.toLocaleString(
                    "fr-FR"
                  ),
                icon: ClipboardList,
                tone: "wine",
              },

              {
                label: "Événements à venir",
                value:
                  stats.upcomingEvents.toLocaleString(
                    "fr-FR"
                  ),
                icon: CalendarDays,
                tone: "gold",
              },

              {
                label: "Bénéficiaires totaux",
                value:
                  stats.totalBeneficiaries.toLocaleString(
                    "fr-FR"
                  ),
                icon: Users,
                tone: "rose",
              },
            ]}
          />
        </Reveal>
      )}

      {/* Main content */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent applications */}

        <Reveal
          delay={80}
          className="card-surface p-6 shadow-card"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg text-ink">
              Candidatures récentes
            </h3>

            <Button
              href="/institution/applications"
              variant="ghost"
              size="sm"
            >
              Tout voir
            </Button>
          </div>

          {isInitialLoading ? (
            <RecentApplicationsSkeleton />
          ) : recentApplications.length === 0 ? (
            <EmptyState
              icon={Inbox}
              message="Aucune candidature reçue pour le moment."
            />
          ) : (
            <ul className="divide-y divide-sand-100">
              {recentApplications.map((application) => {
                const status =
                  statusMap[
                    application.status
                  ] ?? {
                    label: application.status,
                    tone: "neutral" as const,
                  };

                return (
                  <li
                    key={application.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <Avatar
                      name={
                        application.applicantName
                      }
                      src={
                        application.applicantAvatarUrl ??
                        undefined
                      }
                      size="sm"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {
                          application.applicantName
                        }
                      </p>

                      <p className="truncate text-xs text-ink-soft">
                        {
                          application.programTitle
                        }
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        tone={status.tone}
                      >
                        {status.label}
                      </Badge>

                      <span className="hidden items-center gap-1 text-xs text-ink-soft sm:inline-flex">
                        <Clock size={11} />

                        {formatRelativeFr(
                          application.createdAt
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Reveal>

        {/* Distribution */}

        <Reveal
          delay={120}
          className="card-surface p-6 shadow-card"
        >
          <h3 className="mb-5 font-display text-lg text-ink">
            Répartition des candidatures
          </h3>

          {isInitialLoading ? (
            <DistributionSkeleton />
          ) : stats.totalApplications === 0 ? (
            <EmptyState
              icon={ClipboardList}
              message="Aucune candidature à répartir pour le moment."
            />
          ) : (
            <div className="space-y-4">
              {statusDistribution.map(
                (row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <Badge tone={row.tone}>
                        {row.label}
                      </Badge>

                      <span className="font-semibold text-ink">
                        {row.value}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                      <div
                        className="h-full rounded-full bg-rise-gradient transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              row.value
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Button
              href="/institution/applications"
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Voir les candidatures
            </Button>

            <Button
              href="/institution/analytics"
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <TrendingUp size={14} />

              Rapport
            </Button>
          </div>
        </Reveal>
      </div>
    </>
  );
}
