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

const planStatusLabel: Record<string, string> = {
  SUBMITTED: "Soumis",
  IN_REVIEW: "En révision",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
  DRAFT: "Brouillon",
};

const planStatusTone: Record<string, string> = {
  SUBMITTED: "rose",
  IN_REVIEW: "rose",
  APPROVED: "rose",
  REJECTED: "rose",
  DRAFT: "rose",
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
    <div className="card-surface group relative overflow-hidden p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-rose-50" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-ink">
            <Icon size={19} strokeWidth={1.8} />
          </div>

          <ArrowUpRight
            size={16}
            className="text-ink-soft/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>

        <p className="text-2xl font-semibold tracking-tight text-ink">
          {value}
        </p>

        <p className="mt-1 text-sm font-medium text-ink">{label}</p>

        <p className="mt-1 text-xs text-ink-soft">{description}</p>
      </div>
    </div>
  );
}

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
    <article className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/[0.09] hover:shadow-xl">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-300 via-rose-200 to-transparent" />

      <div className="p-5">
        {/* Profile */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <div className="rounded-full p-0.5 ring-2 ring-sand-100">
                <Avatar name={entrepreneur.name} size="sm" />
              </div>

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink">
                {entrepreneur.name}
              </h3>

              <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-ink-soft">
                <Mail size={12} className="shrink-0" />
                <span className="truncate">{entrepreneur.email}</span>
              </p>
            </div>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-50 text-ink-soft transition-colors group-hover:bg-rose-50 group-hover:text-rose-600">
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Relationship badges */}
        <div className="mt-5 flex flex-wrap gap-2">
          {hasPlans && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
              <FileText size={11} />
              {entrepreneur.businessPlans.length} business plan
              {entrepreneur.businessPlans.length > 1 ? "s" : ""}
            </span>
          )}

          {hasSessions && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
              <Calendar size={11} />
              {entrepreneur.sessions.length} session
              {entrepreneur.sessions.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Business plan */}
        {latestPlan && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <FileText size={14} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Business plan
                </span>
              </div>

              <span className="text-[10px] text-ink-soft/60">
                {formatRelativeDate(latestPlan.updatedAt)}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/business-plans/${latestPlan.id}`
                )
              }
              className="group/plan w-full rounded-xl border border-black/[0.05] bg-sand-50/70 p-3 text-left transition-all hover:border-rose-100 hover:bg-rose-50/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {latestPlan.title}
                  </p>

                  <p className="mt-1 text-[11px] text-ink-soft">
                    Mis à jour le {formatDate(latestPlan.updatedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    tone={
                      planStatusTone[latestPlan.status] as
                        | "rose"
                        | undefined
                    }
                  >
                    {planStatusLabel[latestPlan.status] ??
                      latestPlan.status}
                  </Badge>

                  <ChevronRight
                    size={14}
                    className="text-ink-soft/40 transition-transform group-hover/plan:translate-x-0.5"
                  />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Session */}
        {latestSession && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-100 text-ink-soft">
                <Calendar size={14} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Dernière session
              </span>
            </div>

            <div className="rounded-xl border border-black/[0.05] bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-100">
                  <Clock3 size={14} className="text-ink-soft" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {latestSession.topic}
                  </p>

                  <p className="mt-1 text-xs text-ink-soft">
                    {formatDate(latestSession.scheduledAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-black/[0.05] pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <Clock3 size={12} />
            <span>
              Activité : {formatRelativeDate(entrepreneur.lastActivity)}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/messages?user=${entrepreneur.id}`
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink"
          >
            Contacter
            <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}

function EntrepreneurSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-sand-100" />

        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-sand-100" />
          <div className="h-2.5 w-44 animate-pulse rounded bg-sand-100" />
        </div>
      </div>

      <div className="mt-5 h-7 w-28 animate-pulse rounded-full bg-sand-100" />
      <div className="mt-5 h-20 animate-pulse rounded-xl bg-sand-50" />
      <div className="mt-4 h-16 animate-pulse rounded-xl bg-sand-50" />
    </div>
  );
}

export default function EntrepreneursPage() {
  const [entrepreneurs, setEntrepreneurs] = useState<
    EntrepreneurSummary[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "plans" | "sessions">(
    "all"
  );

  useEffect(() => {
    loadEntrepreneurs();
  }, []);

  async function loadEntrepreneurs() {
    try {
      setLoading(true);
      setError(null);

      const data = await listMyEntrepreneurs();
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

  const filteredEntrepreneurs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entrepreneurs.filter((entrepreneur) => {
      const matchesSearch =
        !query ||
        entrepreneur.name.toLowerCase().includes(query) ||
        entrepreneur.email.toLowerCase().includes(query) ||
        entrepreneur.businessPlans.some((plan) =>
          plan.title.toLowerCase().includes(query)
        );

      const matchesFilter =
        filter === "all" ||
        (filter === "plans" &&
          entrepreneur.businessPlans.length > 0) ||
        (filter === "sessions" &&
          entrepreneur.sessions.length > 0);

      return matchesSearch && matchesFilter;
    });
  }, [entrepreneurs, search, filter]);

  const totalPlans = entrepreneurs.reduce(
    (sum, entrepreneur) =>
      sum + entrepreneur.businessPlans.length,
    0
  );

  const totalSessions = entrepreneurs.reduce(
    (sum, entrepreneur) => sum + entrepreneur.sessions.length,
    0
  );

  return (
    <>
      <Header title="Mes entrepreneures" />

      <main className="space-y-7">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-black/[0.05] bg-gradient-to-br from-white via-white to-sand-50 p-6 shadow-sm md:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-100/40 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sand-100/70 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600">
                <Sparkles size={13} />
                Votre réseau d'entrepreneures
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                Vue d’ensemble
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
                Retrouvez les entrepreneures avec lesquelles vous
                travaillez, leurs business plans et vos sessions
                d’accompagnement.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-black/[0.05] bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100">
                <Users size={18} className="text-ink" />
              </div>

              <div>
                <p className="text-xl font-semibold text-ink">
                  {entrepreneurs.length}
                </p>
                <p className="text-xs text-ink-soft">
                  entrepreneure
                  {entrepreneurs.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        {!loading && !error && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Search + filters */}
        {!loading && !error && entrepreneurs.length > 0 && (
          <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une entrepreneure..."
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-white pl-10 pr-4 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/50 focus:border-rose-200 focus:ring-4 focus:ring-rose-50"
              />
            </div>

            <div className="flex w-full gap-1 rounded-xl border border-black/[0.06] bg-white p-1 md:w-auto">
              {[
                { value: "all", label: "Toutes" },
                { value: "plans", label: "Business plans" },
                { value: "sessions", label: "Sessions" },
              ].map((item) => {
                const active = filter === item.value;

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
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      active
                        ? "bg-ink text-white shadow-sm"
                        : "text-ink-soft hover:bg-sand-50 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Impossible de charger vos entrepreneures
                </p>

                <p className="mt-1 text-xs text-rose-600/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadEntrepreneurs}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-ink shadow-sm transition hover:bg-sand-50"
              >
                <RefreshCw size={14} />
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <EntrepreneurSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          entrepreneurs.length === 0 && (
            <div className="rounded-3xl border border-black/[0.05] bg-white p-8 shadow-sm md:p-12">
              <EmptyState
                icon={Users}
                title="Aucune entrepreneure pour le moment"
                description="Les entrepreneures dont vous révisez le business plan ou avec qui vous avez une session apparaîtront automatiquement ici."
              />
            </div>
          )}

        {/* No search result */}
        {!loading &&
          !error &&
          entrepreneurs.length > 0 &&
          filteredEntrepreneurs.length === 0 && (
            <div className="rounded-3xl border border-black/[0.05] bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100">
                <Search size={22} className="text-ink-soft" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-ink">
                Aucun résultat
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-ink-soft">
                Aucune entrepreneure ne correspond à votre recherche
                ou au filtre sélectionné.
              </p>
            </div>
          )}

        {/* Cards */}
        {!loading &&
          !error &&
          filteredEntrepreneurs.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    Vos entrepreneures
                  </h2>

                  <p className="mt-0.5 text-xs text-ink-soft">
                    {filteredEntrepreneurs.length} résultat
                    {filteredEntrepreneurs.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs text-ink-soft sm:flex">
                  <BriefcaseBusiness size={14} />
                  Accompagnement
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEntrepreneurs.map((entrepreneur) => (
                  <EntrepreneurCard
                    key={entrepreneur.id}
                    entrepreneur={entrepreneur}
                  />
                ))}
              </div>
            </section>
          )}
      </main>
    </>
  );
}

