"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Calendar,
  Mail,
  Users,
  ArrowUpRight,
  Clock3,
  BriefcaseBusiness,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";

import {
  listMyEntrepreneurs,
  EntrepreneurSummary,
} from "@/lib/api/entrepreneurs";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const planStatusLabel: Record<string, string> = {
  SUBMITTED: "Soumis",
  IN_REVIEW: "En révision",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
  DRAFT: "Brouillon",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(date: string) {
  const now = new Date();
  const value = new Date(date);
  const diff = now.getTime() - value.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days < 7) return `Il y a ${days} j`;

  return formatDate(date);
}

/* ------------------------------------------------------------------ */
/* Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-rose-100/80 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-bloom">
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rise-gradient-soft opacity-60 blur-xl"
      />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <Icon size={19} strokeWidth={1.8} />
          </div>

          <ArrowUpRight
            size={16}
            className="text-rose-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>

        <p className="font-display text-2xl font-semibold text-wine-900">
          {value}
        </p>

        <p className="mt-1 text-sm font-semibold text-ink">
          {label}
        </p>

        <p className="mt-1 text-xs text-ink-soft">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Entrepreneur Card                                                  */
/* ------------------------------------------------------------------ */

function EntrepreneurCard({
  entrepreneur,
}: {
  entrepreneur: EntrepreneurSummary;
}) {
  const router = useRouter();

  const latestPlan = entrepreneur.businessPlans[0];
  const latestSession = entrepreneur.sessions[0];

  const hasPlans = entrepreneur.businessPlans.length > 0;
  const hasSessions = entrepreneur.sessions.length > 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-rose-100/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-200 hover:shadow-bloom">
      {/* ------------------------------------------------------------ */}
      {/* Decorative header                                            */}
      {/* ------------------------------------------------------------ */}

      <div className="relative h-28 overflow-hidden bg-rise-gradient-soft">
        <div
          aria-hidden
          className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/30 blur-2xl"
        />

        <div
          aria-hidden
          className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-rose-200/30 blur-2xl"
        />

        <div className="absolute left-5 top-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 font-body text-[11px] font-semibold text-wine-700 shadow-sm backdrop-blur-sm">
            <Users size={12} />
            Entrepreneure
          </span>
        </div>

        <div className="absolute right-5 top-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 font-body text-[11px] font-medium text-rose-600 shadow-sm backdrop-blur-sm">
            <Sparkles size={11} />
            Accompagnement
          </span>
        </div>

        {/* Floating avatar */}
        <div className="absolute bottom-[-20px] left-5">
          <div className="rounded-2xl border-4 border-white bg-white p-0.5 shadow-md">
            <Avatar
              name={entrepreneur.name}
              size="sm"
            />
          </div>

          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Content                                                      */}
      {/* ------------------------------------------------------------ */}

      <div className="flex flex-1 flex-col p-5 pt-8">
        {/* Profile */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-semibold text-wine-900 transition-colors group-hover:text-rose-600">
              {entrepreneur.name}
            </h3>

            <p className="mt-1.5 flex min-w-0 items-center gap-1.5 truncate text-xs text-ink-soft">
              <Mail
                size={12}
                className="shrink-0 text-rose-400"
              />

              <span className="truncate">
                {entrepreneur.email}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/messages?user=${entrepreneur.id}`
              )
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all hover:bg-rose-100 hover:text-rose-600"
            title="Contacter"
          >
            <ArrowUpRight size={16} />
          </button>
        </div>

        {/* Relationship badges */}
        <div className="mt-5 flex flex-wrap gap-2">
          {hasPlans && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600">
              <FileText size={11} />

              {entrepreneur.businessPlans.length} business plan
              {entrepreneur.businessPlans.length > 1
                ? "s"
                : ""}
            </span>
          )}

          {hasSessions && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-[11px] font-semibold text-ink-soft">
              <Calendar size={11} />

              {entrepreneur.sessions.length} session
              {entrepreneur.sessions.length > 1
                ? "s"
                : ""}
            </span>
          )}
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Business plan                                              */}
        {/* ---------------------------------------------------------- */}

        {latestPlan && (
          <div className="mt-6">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <FileText size={14} />
                </div>

                <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  Business plan
                </span>
              </div>

              <span className="text-[10px] text-ink-soft/60">
                {formatRelativeDate(
                  latestPlan.updatedAt
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/business-plans/${latestPlan.id}`
                )
              }
              className="group/plan w-full rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-sand-50 p-4 text-left transition-all hover:border-rose-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-wine-800">
                    {latestPlan.title}
                  </p>

                  <p className="mt-1.5 text-[11px] text-ink-soft">
                    Mis à jour le{" "}
                    {formatDate(
                      latestPlan.updatedAt
                    )}
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="shrink-0 text-rose-300 transition-transform group-hover/plan:translate-x-1"
                />
              </div>

              <div className="mt-3">
                <Badge tone="rose">
                  {planStatusLabel[
                    latestPlan.status
                  ] ?? latestPlan.status}
                </Badge>
              </div>
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------- */}
        {/* Session                                                     */}
        {/* ---------------------------------------------------------- */}

        {latestSession && (
          <div className="mt-5">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-100 text-ink-soft">
                <Calendar size={14} />
              </div>

              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                Dernière session
              </span>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand-100">
                  <Clock3
                    size={14}
                    className="text-ink-soft"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-ink">
                    {latestSession.topic}
                  </p>

                  <p className="mt-1 text-xs text-ink-soft">
                    {formatDate(
                      latestSession.scheduledAt
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ---------------------------------------------------------- */}
        {/* Footer                                                     */}
        {/* ---------------------------------------------------------- */}

        <div className="mt-6 flex items-center justify-between border-t border-rose-100 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <Clock3 size={12} />

            <span>
              Activité :{" "}
              {formatRelativeDate(
                entrepreneur.lastActivity
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/messages?user=${entrepreneur.id}`
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-wine-700 transition-all hover:bg-rose-50 hover:text-rose-600"
          >
            Contacter
            <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-1 w-full bg-rise-gradient opacity-70" />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                           */
/* ------------------------------------------------------------------ */

function EntrepreneurSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-rose-100 bg-white shadow-card">
      <div className="h-28 animate-pulse bg-rose-50" />

      <div className="p-5">
        <div className="space-y-2">
          <div className="h-5 w-36 animate-pulse rounded bg-sand-100" />
          <div className="h-3 w-48 animate-pulse rounded bg-sand-100" />
        </div>

        <div className="mt-5 h-7 w-32 animate-pulse rounded-full bg-sand-100" />

        <div className="mt-5 h-24 animate-pulse rounded-2xl bg-sand-50" />

        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-sand-50" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function EntrepreneursPage() {
  const [entrepreneurs, setEntrepreneurs] =
    useState<EntrepreneurSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] = useState<
    "all" | "plans" | "sessions"
  >("all");

  useEffect(() => {
    loadEntrepreneurs();
  }, []);

  async function loadEntrepreneurs() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await listMyEntrepreneurs();

      setEntrepreneurs(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les entrepreneures."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredEntrepreneurs =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return entrepreneurs.filter(
        (entrepreneur) => {
          const matchesSearch =
            !query ||
            entrepreneur.name
              .toLowerCase()
              .includes(query) ||
            entrepreneur.email
              .toLowerCase()
              .includes(query) ||
            entrepreneur.businessPlans.some(
              (plan) =>
                plan.title
                  .toLowerCase()
                  .includes(query)
            );

          const matchesFilter =
            filter === "all" ||
            (filter === "plans" &&
              entrepreneur.businessPlans
                .length > 0) ||
            (filter === "sessions" &&
              entrepreneur.sessions
                .length > 0);

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [entrepreneurs, search, filter]);

  const totalPlans =
    entrepreneurs.reduce(
      (sum, entrepreneur) =>
        sum +
        entrepreneur.businessPlans.length,
      0
    );

  const totalSessions =
    entrepreneurs.reduce(
      (sum, entrepreneur) =>
        sum + entrepreneur.sessions.length,
      0
    );

  return (
    <>
      {/* Existing global/header component */}

      <main className="min-h-screen bg-sand-50 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* ====================================================== */}
          {/* HOMOGENEOUS HEADER                                     */}
          {/* ====================================================== */}

          <div className="mb-10">
            {/* Breadcrumb */}
            <div className="mb-8 text-sm text-ink-soft">
              <span>Espace Experte</span>

              <span className="mx-2 text-ink-soft/40">
                /
              </span>

              <span className="font-medium text-wine-700">
                Entrepreneures
              </span>
            </div>

            {/* Header Section */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl"
              />

              <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-script text-2xl leading-none text-rose-500">
                    Votre réseau
                  </p>

                  <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
                    Gestion -{" "}
                    <span className="text-gradient-rise">
                      Entrepreneures
                    </span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
                    Retrouvez les entrepreneures que
                    vous accompagnez, leurs business plans
                    et vos sessions de suivi.
                  </p>
                </div>

                {/* Small total */}
                <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-rose-100 bg-white px-5 py-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <Users size={18} />
                  </div>

                  <div>
                    <p className="font-display text-xl font-semibold text-wine-900">
                      {entrepreneurs.length}
                    </p>

                    <p className="text-xs text-ink-soft">
                      entrepreneure
                      {entrepreneurs.length > 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* STATS                                                   */}
          {/* ====================================================== */}

          {!loading && !error && (
            <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Users}
                label="Entrepreneures"
                value={entrepreneurs.length}
                description="Personnes accompagnées"
              />

              <StatCard
                icon={FileText}
                label="Business plans"
                value={totalPlans}
                description="Plans suivis ou révisés"
              />

              <StatCard
                icon={Calendar}
                label="Sessions"
                value={totalSessions}
                description="Sessions d'accompagnement"
              />
            </section>
          )}

          {/* ====================================================== */}
          {/* SEARCH + FILTERS                                       */}
          {/* ====================================================== */}

          {!loading &&
            !error &&
            entrepreneurs.length > 0 && (
              <section className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-md">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Rechercher une entrepreneure..."
                    className="h-11 w-full rounded-xl border border-rose-100 bg-white pl-11 pr-4 font-body text-sm text-ink outline-none shadow-sm transition-all placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                  />
                </div>

                {/* Filters */}
                <div className="flex w-full gap-1 rounded-xl border border-rose-100 bg-white p-1 shadow-sm md:w-auto">
                  {[
                    {
                      value: "all",
                      label: "Toutes",
                    },
                    {
                      value: "plans",
                      label: "Business plans",
                    },
                    {
                      value: "sessions",
                      label: "Sessions",
                    },
                  ].map((item) => {
                    const active =
                      filter === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setFilter(
                            item.value as
                              | "all"
                              | "plans"
                              | "sessions"
                          )
                        }
                        className={`rounded-lg px-3 py-2 font-body text-xs font-medium transition-all ${
                          active
                            ? "bg-rise-gradient text-white shadow-sm"
                            : "text-ink-soft hover:bg-rose-50 hover:text-wine-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

          {/* ====================================================== */}
          {/* ERROR                                                   */}
          {/* ====================================================== */}

          {error && (
            <div className="mb-7 rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-body text-sm font-semibold text-wine-700">
                    Impossible de charger vos entrepreneures
                  </p>

                  <p className="mt-1 font-body text-xs text-rose-600/80">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadEntrepreneurs}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-body text-xs font-semibold text-wine-700 shadow-sm transition hover:bg-rose-50"
                >
                  <RefreshCw size={14} />
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* LOADING                                                 */}
          {/* ====================================================== */}

          {loading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <EntrepreneurSkeleton
                    key={index}
                  />
                )
              )}
            </div>
          )}

          {/* ====================================================== */}
          {/* EMPTY                                                   */}
          {/* ====================================================== */}

          {!loading &&
            !error &&
            entrepreneurs.length === 0 && (
              <div className="rounded-[1.75rem] border border-rose-100 bg-white p-8 shadow-card md:p-12">
                <EmptyState
                  icon={Users}
                  title="Aucune entrepreneure pour le moment"
                  description="Les entrepreneures dont vous révisez le business plan ou avec qui vous avez une session apparaîtront automatiquement ici."
                />
              </div>
            )}

          {/* ====================================================== */}
          {/* NO SEARCH RESULTS                                       */}
          {/* ====================================================== */}

          {!loading &&
            !error &&
            entrepreneurs.length > 0 &&
            filteredEntrepreneurs.length === 0 && (
              <div className="rounded-[1.75rem] border border-rose-100 bg-white px-6 py-14 text-center shadow-card">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
                  <Search size={22} />
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold text-wine-800">
                  Aucun résultat
                </h3>

                <p className="mx-auto mt-1 max-w-sm font-body text-xs leading-5 text-ink-soft">
                  Aucune entrepreneure ne
                  correspond à votre recherche ou
                  au filtre sélectionné.
                </p>
              </div>
            )}

          {/* ====================================================== */}
          {/* ENTREPRENEUR CARDS                                     */}
          {/* ====================================================== */}

          {!loading &&
            !error &&
            filteredEntrepreneurs.length > 0 && (
              <section>
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="font-script text-lg text-rose-400">
                      Accompagnement
                    </p>

                    <h2 className="font-display text-xl font-semibold text-wine-900">
                      Vos entrepreneures
                    </h2>

                    <p className="mt-1 text-xs text-ink-soft">
                      {filteredEntrepreneurs.length} résultat
                      {filteredEntrepreneurs.length > 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 text-xs text-ink-soft sm:flex">
                    <BriefcaseBusiness size={14} />
                    Suivi personnalisé
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEntrepreneurs.map(
                    (entrepreneur) => (
                      <EntrepreneurCard
                        key={entrepreneur.id}
                        entrepreneur={entrepreneur}
                      />
                    )
                  )}
                </div>
              </section>
            )}
        </div>
      </main>
    </>
  );
}
