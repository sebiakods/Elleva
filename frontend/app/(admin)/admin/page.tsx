"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Users,
  Landmark,
  FileText,
  TrendingUp,
  UserPlus,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { Charts } from "@/components/admin/Charts";

import { UsersTable } from "@/components/admin/UsersTable";
import {
  getAdminOverview,
  type AdminOverviewData,
} from "@/lib/api/admin";

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const result = await getAdminOverview();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error("ADMIN OVERVIEW ERROR:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les données du tableau de bord."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const showSkeleton = loading || !data;

  return (
    <div className="w-full max-w-full overflow-x-hidden p-5 sm:p-6 lg:p-8">
      {/* BREADCRUMB */}
      <div className="mb-7 text-sm text-ink-soft">
        <span>Espace Admin</span>
        <span className="mx-2 text-ink-soft/40">/</span>
        <span className="font-medium text-wine-700">
          Tableau de bord
        </span>
      </div>

      {/* HERO */}
      <section className="relative mb-8 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute right-32 top-10 -z-10 h-24 w-24 rounded-full bg-rose-100/60 blur-2xl"
        />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-script text-2xl leading-none text-rose-500">
              Bonjour, Admin
            </p>

            <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
              Vue{" "}
              <span className="text-gradient-rise">
                d'ensemble
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Suivez l'activité de la plateforme, les utilisateurs,
              les programmes et les performances d'Ellevadz depuis
              votre espace d'administration.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-2xl border border-sand-200 bg-white px-4 py-3 shadow-sm lg:self-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
              <Sparkles
                size={17}
                className="text-rose-500"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-ink">
                Plateforme active
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-ink-soft">
                  Système opérationnel
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* MAIN ANALYTICS */}
      <AnalyticsCards
        items={[
          {
            label: "Utilisateurs actifs",
            value: showSkeleton
              ? "…"
              : data.analytics.activeUsers.toLocaleString(
                  "fr-FR"
                ),
            change: "",
            icon: Users,
          },
          {
            label: "Programmes publiés",
            value: showSkeleton
              ? "…"
              : String(data.analytics.publishedPrograms),
            change: "",
            icon: Landmark,
          },
          {
            label: "Business plans soumis",
            value: showSkeleton
              ? "…"
              : String(
                  data.analytics.submittedBusinessPlans
                ),
            change: "",
            icon: FileText,
          },
          {
            label: "Taux de complétion",
            value: showSkeleton
              ? "…"
              : `${data.analytics.completionRate}%`,
            change: "",
            icon: TrendingUp,
          },
        ]}
      />

      {/* QUICK ACTIVITY */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickStat
          icon={
            <UserPlus
              size={17}
              className="text-rose-500"
            />
          }
          iconBg="bg-rose-50"
          label="Nouvelles inscriptions"
          value={
            showSkeleton
              ? "…"
              : data.quickActivity.newSignups
          }
        />

        <QuickStat
          icon={
            <Clock3
              size={17}
              className="text-amber-600"
            />
          }
          iconBg="bg-amber-50"
          label="Demandes en attente"
          value={
            showSkeleton
              ? "…"
              : data.quickActivity.pendingRequests
          }
          note="À examiner"
          noteClass="text-amber-600"
        />

        <QuickStat
          icon={
            <CheckCircle2
              size={17}
              className="text-wine-700"
            />
          }
          iconBg="bg-wine-50"
          label="Contenus publiés"
          value={
            showSkeleton
              ? "…"
              : data.quickActivity.publishedContent
          }
          note="Actifs"
          noteClass="text-emerald-600"
        />

        <QuickStat
          icon={
            <AlertCircle
              size={17}
              className="text-rose-500"
            />
          }
          iconBg="bg-rose-50"
          label="Actions requises"
          value={
            showSkeleton
              ? "…"
              : data.quickActivity.actionsRequired
          }
          note="À traiter"
          noteClass="text-rose-600"
        />
      </div>

      {/* CHART + ROLE DISTRIBUTION */}
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* CHART */}
        <div className="card-surface overflow-hidden shadow-card">
          <div className="flex items-start justify-between border-b border-sand-100 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Activité de la plateforme
              </h2>

              <p className="mt-1 text-xs text-ink-soft">
                Évolution des activités au cours des derniers
                mois.
              </p>
            </div>

            <span className="rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-[11px] font-medium text-ink-soft">
              6 derniers mois
            </span>
          </div>

          <div className="p-5">
            <Charts
              data={data?.chart ?? []}
              loading={showSkeleton}
            />
          </div>
        </div>

        {/* ROLE DISTRIBUTION */}
        <div className="card-surface p-5 shadow-card">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              Répartition des rôles
            </h2>

            <p className="mt-1 text-xs text-ink-soft">
              Distribution actuelle des utilisateurs.
            </p>
          </div>

          {showSkeleton ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <div className="mb-2 h-4 w-32 animate-pulse rounded bg-sand-100" />
                  <div className="h-2 animate-pulse rounded-full bg-sand-100" />
                </div>
              ))}
            </div>
          ) : data.roleDistribution.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-soft">
              Aucune donnée disponible.
            </div>
          ) : (
            <div className="space-y-5">
              {data.roleDistribution.map((role) => (
                <div key={role.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">
                      {role.label}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-soft">
                        {role.count.toLocaleString("fr-FR")}
                      </span>

                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                        {role.pct}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                    <div
                      className="h-full rounded-full bg-rise-gradient transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(role.pct, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 rounded-2xl bg-sand-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink">
                  Total utilisateurs
                </p>

                <p className="mt-1 font-display text-2xl font-semibold text-wine-900">
                  {showSkeleton
                    ? "…"
                    : data.totalUsers.toLocaleString(
                        "fr-FR"
                      )}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Users
                  size={17}
                  className="text-wine-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT USERS */}
      <section className="mt-7">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-script text-xl leading-none text-rose-500">
              Activité récente,
            </p>

            <h2 className="mt-1 font-display text-xl font-semibold text-ink">
              Derniers utilisateurs inscrits
            </h2>

            <p className="mt-1 text-xs text-ink-soft">
              Les derniers comptes créés sur la plateforme.
            </p>
          </div>
        </div>

        <UsersTable
          users={data?.recentUsers ?? []}
          loading={showSkeleton}
        />
      </section>
    </div>
  );
}

function QuickStat({
  icon,
  iconBg,
  label,
  value,
  note,
  noteClass,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  note?: string;
  noteClass?: string;
}) {
  return (
    <div className="card-surface group p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            {label}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-display text-xl font-semibold text-wine-900">
              {value}
            </span>

            {note && (
              <span
                className={`text-[10px] font-medium ${
                  noteClass ?? ""
                }`}
              >
                {note}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
