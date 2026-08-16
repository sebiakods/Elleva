"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Heart, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { listMyPlans, BusinessPlan, BusinessPlanStatus } from "@/lib/api/businessPlans";

const statusLabel: Record<BusinessPlanStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  IN_REVIEW: "En révision",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

const statusTone: Record<BusinessPlanStatus, "neutral" | "wine" | "rose" | "gold"> = {
  DRAFT: "neutral",
  SUBMITTED: "gold",
  IN_REVIEW: "wine",
  APPROVED: "rose",
  REJECTED: "neutral",
};

function linkFor(plan: BusinessPlan) {
  const locked = plan.status === "APPROVED" || plan.status === "REJECTED";
  return locked
    ? `/dashboard/business-plans/${plan.id}/preview`
    : `/dashboard/business-plans/${plan.id}`;
}

export default function BusinessPlansListPage() {
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyPlans()
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Entrepreneuse</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Business Plans</span>
        </div>

        {/* Header */}
        <div className="relative mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <div>
            <p className="font-script text-2xl leading-none text-rose-500">
              Vue d'ensemble
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
              Mes <span className="text-gradient-rise">business plans</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Gérez, rédigez et suivez l'avancement de vos projets d'entreprise en un coup d'œil.
            </p>
          </div>

          <Button href="/dashboard/business-plans/new" className="shrink-0">
            <Plus size={16} /> Nouveau plan
          </Button>
        </div>

        {/* Dynamic content states */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-[2rem] border border-rose-100/60 bg-white/70"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-rose-200 bg-white/60 px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
              <Sparkle size={22} />
            </div>
            <p className="font-script text-xl text-rose-500">Une page blanche, pleine de promesses</p>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              Aucun business plan pour le moment. Lancez le vôtre en quelques minutes.
            </p>
            <Button href="/dashboard/business-plans/new" className="mt-5">
              <Plus size={16} /> Créer mon premier plan
            </Button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const locked = p.status === "APPROVED" || p.status === "REJECTED";

            return (
              <Link
                key={p.id}
                href={linkFor(p)}
                className="
                  card-plan
                  group
                  relative
                  block
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-rose-100/70
                  bg-white
                  p-6
                  shadow-card
                  transition-all
                  duration-300
                  hover:-translate-y-1.5
                  hover:border-rose-200
                  hover:shadow-bloom
                "
              >
                {/* decorative corner bloom */}
                <div
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-32
                    w-32
                    rounded-full
                    bg-rise-gradient-soft
                    opacity-0
                    blur-2xl
                    transition-opacity
                    duration-500
                    group-hover:opacity-70
                  "
                />

                {/* floating heart accent */}
                <Heart
                  size={14}
                  className="
                    absolute
                    right-5
                    top-5
                    text-rose-200
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:translate-y-0.5
                    group-hover:opacity-100
                  "
                  fill="currentColor"
                />

                <div className="relative">
                  {/* icon badge */}
                  <div
                    className="
                      mb-4
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-rise-gradient
                      text-white
                      shadow-sm
                      transition-transform
                      duration-300
                      group-hover:scale-105
                      group-hover:rotate-3
                    "
                  >
                    <FileText size={19} />
                  </div>

                  <p className="font-script text-lg leading-none text-rose-400">
                    Mon projet
                  </p>

                  <h3 className="mt-1.5 mb-3 line-clamp-2 font-display text-lg font-semibold text-wine-900">
                    {p.title}
                  </h3>

                  <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>

                  {/* ribbon-style progress */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                        Avancement
                      </span>
                      <span className="text-xs font-semibold text-rose-500">
                        {p.progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-rose-50">
                      <div
                        className="h-full rounded-full bg-rise-gradient shadow-[0_0_8px_rgba(244,63,94,0.35)] transition-all duration-500"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  {locked && p.reviewNotes && (
                    <div className="mt-4 rounded-2xl bg-sand-50 p-3">
                      {p.reviewScore != null && (
                        <p className="text-[11px] font-semibold text-rose-600">
                          {p.reviewScore}/100
                        </p>
                      )}
                      <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">
                        {p.reviewNotes}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}