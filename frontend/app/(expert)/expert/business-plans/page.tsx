"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Reveal } from "@/components/common/Reveal";

import {
  listSubmittedPlans,
  BusinessPlan,
  BusinessPlanStatus,
} from "@/lib/api/businessPlans";

const statusMap: Record<
  BusinessPlanStatus,
  {
    label: string;
    tone: "gold" | "wine" | "rose" | "neutral";
    icon: typeof Clock;
  }
> = {
  DRAFT: {
    label: "Brouillon",
    tone: "neutral",
    icon: Clock,
  },

  SUBMITTED: {
    label: "En attente",
    tone: "gold",
    icon: Clock,
  },

  IN_REVIEW: {
    label: "En révision",
    tone: "wine",
    icon: MessageCircle,
  },

  APPROVED: {
    label: "Approuvé",
    tone: "rose",
    icon: CheckCircle2,
  },

  REJECTED: {
    label: "Rejeté",
    tone: "neutral",
    icon: CheckCircle2,
  },
};

function formatRelative(dateStr: string) {
  if (!dateStr) return "Inconnu";

  const diffMs =
    Date.now() - new Date(dateStr).getTime();

  if (isNaN(diffMs)) return "Inconnu";

  const h = Math.floor(
    diffMs / 3_600_000
  );

  if (h < 1) return "À l'instant";

  if (h < 24) return `Il y a ${h}h`;

  const d = Math.floor(h / 24);

  return d === 1
    ? "Hier"
    : `Il y a ${d}j`;
}

/* ------------------------------------------------------------------ */
/* Business Plan Card                                                 */
/* ------------------------------------------------------------------ */

function PlanCard({
  plan,
}: {
  plan: BusinessPlan;
}) {
  const router = useRouter();

  const status = statusMap[plan.status];

  const StatusIcon = status.icon;

  const isCompleted =
    plan.status === "APPROVED" ||
    plan.status === "REJECTED";

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-rose-100/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-200 hover:shadow-bloom">
      {/* ---------------------------------------------------------- */}
      {/* Decorative top                                            */}
      {/* ---------------------------------------------------------- */}

      <div className="relative h-28 overflow-hidden bg-rise-gradient-soft">
        <div
          aria-hidden
          className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/30 blur-2xl"
        />

        <div
          aria-hidden
          className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-rose-200/30 blur-2xl"
        />

        <div className="absolute left-5 top-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 font-body text-[11px] font-semibold text-wine-700 shadow-sm backdrop-blur-sm">
            <FileText size={12} />
            Business Plan
          </span>
        </div>

        <div className="absolute right-5 top-5">
          <Badge tone={status.tone}>
            <span className="inline-flex items-center gap-1.5">
              <StatusIcon size={12} />
              {status.label}
            </span>
          </Badge>
        </div>

        {/* Avatar floating over card */}
        <div className="absolute bottom-[-18px] left-5 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-md">
          <Avatar
            name={plan.owner?.name ?? "?"}
            size="sm"
          />
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Content                                                    */}
      {/* ---------------------------------------------------------- */}

      <div className="flex flex-1 flex-col p-5 pt-7">
        {/* Owner */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <p className="font-body text-sm font-semibold text-wine-800">
              {plan.owner?.name ?? "Anonyme"}
            </p>

            <span className="h-1 w-1 rounded-full bg-rose-300" />

            <p className="flex items-center gap-1 font-body text-xs text-ink-soft">
              <Clock size={11} />
              {formatRelative(plan.updatedAt)}
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-display text-xl font-semibold leading-snug text-wine-900 transition-colors group-hover:text-rose-600">
            {plan.title}
          </h3>

          <div className="mt-3 h-px w-12 bg-gradient-to-r from-rose-300 to-transparent" />
        </div>

        {/* Score */}
        {plan.reviewScore != null ? (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 to-sand-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
                  <Star size={13} />
                </span>

                <span className="font-body text-xs font-bold uppercase tracking-[0.12em] text-rose-500">
                  Score de révision
                </span>
              </div>

              <span className="font-display text-base font-semibold text-wine-800">
                {plan.reviewScore}
                <span className="text-xs text-ink-soft">
                  /100
                </span>
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-rise-gradient transition-all duration-500"
                style={{
                  width: `${Math.min(
                    Math.max(plan.reviewScore, 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-rose-400 shadow-sm">
              <Sparkles size={15} />
            </div>

            <div>
              <p className="font-body text-xs font-semibold text-wine-700">
                Révision à effectuer
              </p>

              <p className="mt-0.5 font-body text-[11px] text-ink-soft">
                Aucun score n&apos;a encore été attribué.
              </p>
            </div>
          </div>
        )}

        {/* Action */}
        <div className="mt-auto pt-6">
          <Button
            size="sm"
            variant={
              isCompleted
                ? "secondary"
                : "primary"
            }
            className="group/button w-full rounded-xl"
            onClick={() =>
              router.push(
                `/expert/business-plans/${plan.id}`
              )
            }
          >
            {isCompleted
              ? "Voir le rapport"
              : "Commencer la révision"}

            <ArrowRight
              size={14}
              className="ml-1 transition-transform duration-200 group-hover/button:translate-x-1"
            />
          </Button>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-1 w-full bg-rise-gradient opacity-70" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty Content                                                     */
/* ------------------------------------------------------------------ */

function EmptyPlans({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-rose-100 bg-white shadow-card">
      <div className="relative px-6 py-12">
        <div
          aria-hidden
          className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-rose-100/60 blur-3xl"
        />

        <div
          aria-hidden
          className="absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-pink-100/50 blur-3xl"
        />

        <div className="relative">
          <EmptyState
            icon={FileText}
            title={title}
            description={description}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function ExpertBusinessPlansPage() {
  const [search, setSearch] = useState("");

  const [pending, setPending] =
    useState<BusinessPlan[]>([]);

  const [completed, setCompleted] =
    useState<BusinessPlan[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    Promise.all([
      listSubmittedPlans("pending"),
      listSubmittedPlans("completed"),
    ])
      .then(([p, c]) => {
        setPending(p.items);
        setCompleted(c.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const matches = (p: BusinessPlan) =>
    p.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (p.owner?.name ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());

  function filterByStatus(
    status: BusinessPlanStatus
  ) {
    return pending
      .filter((p) => p.status === status)
      .filter(matches);
  }

  function filterCompleted() {
    return completed.filter(matches);
  }

  const pendingList =
    filterByStatus("SUBMITTED");

  const inReviewList =
    filterByStatus("IN_REVIEW");

  const completedList =
    filterCompleted();

  /* -------------------------------------------------------------- */
  /* Loading                                                        */
  /* -------------------------------------------------------------- */

  if (loading) {
    return (
      <>
       
        <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-full bg-rose-100" />

                <Sparkles
                  size={22}
                  className="relative text-rose-500"
                />
              </div>

              <p className="font-body text-sm text-ink-soft">
                Chargement des business plans...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* -------------------------------------------------------------- */
  /* Page                                                           */
  /* -------------------------------------------------------------- */

  return (
    <>      

      <main className="min-h-screen bg-sand-50 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* ====================================================== */}
          {/* HEADER                                                  */}
          {/* ====================================================== */}

          <div className="mb-10">
            {/* Breadcrumb */}
            <div className="mb-8 text-sm text-ink-soft">
              <span>Espace Experte</span>

              <span className="mx-2 text-ink-soft/40">
                /
              </span>

              <span className="font-medium text-wine-700">
                Business Plans
              </span>
            </div>

            {/* Header */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl"
              />

              <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-script text-2xl leading-none text-rose-500">
                    Accompagnement
                  </p>

                  <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
                    Révision -{" "}
                    <span className="text-gradient-rise">
                      Business Plans
                    </span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
                    Analysez les projets des entrepreneures,
                    partagez votre expertise et accompagnez-les
                    dans la réussite de leur projet.
                  </p>
                </div>

                {/* Small stats */}
                <div className="flex shrink-0 items-center gap-2">
                  <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-sm">
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.12em] text-rose-400">
                      À traiter
                    </p>

                    <p className="mt-0.5 font-display text-xl font-semibold text-wine-800">
                      {pendingList.length +
                        inReviewList.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-sm">
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.12em] text-rose-400">
                      Terminés
                    </p>

                    <p className="mt-0.5 font-display text-xl font-semibold text-wine-800">
                      {completedList.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* SEARCH                                                  */}
          {/* ====================================================== */}

          <div className="mb-7">
            <div className="relative max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search
                  size={16}
                  className="text-rose-400"
                />
              </div>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher un projet ou une entrepreneure..."
                className="h-12 w-full rounded-2xl border border-rose-100 bg-white pl-11 pr-4 font-body text-sm text-ink outline-none shadow-sm transition placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-100/50"
              />
            </div>
          </div>

          {/* ====================================================== */}
          {/* TABS                                                    */}
          {/* ====================================================== */}

          <Tabs
            tabs={[
              {
                label: `En attente (${pendingList.length})`,
                content:
                  pendingList.length === 0 ? (
                    <EmptyPlans
                      title="Aucun plan en attente"
                      description="Vous êtes à jour ! Aucun business plan ne nécessite votre attention pour le moment."
                    />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {pendingList.map((p) => (
                        <Reveal key={p.id}>
                          <PlanCard plan={p} />
                        </Reveal>
                      ))}
                    </div>
                  ),
              },

              {
                label: `En révision (${inReviewList.length})`,
                content:
                  inReviewList.length === 0 ? (
                    <EmptyPlans
                      title="Aucun plan en révision"
                      description="Vous n'avez aucun business plan en cours de révision."
                    />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {inReviewList.map((p) => (
                        <Reveal key={p.id}>
                          <PlanCard plan={p} />
                        </Reveal>
                      ))}
                    </div>
                  ),
              },

              {
                label: `Terminés (${completedList.length})`,
                content:
                  completedList.length === 0 ? (
                    <EmptyPlans
                      title="Aucun plan terminé"
                      description="Aucun business plan n'a encore été révisé."
                    />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {completedList.map((p) => (
                        <Reveal key={p.id}>
                          <PlanCard plan={p} />
                        </Reveal>
                      ))}
                    </div>
                  ),
              },
            ]}
          />
        </div>
      </main>
    </>
  );
}
