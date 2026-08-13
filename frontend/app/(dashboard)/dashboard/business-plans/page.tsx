"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
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

// Locked plans (already reviewed) open the read-only feedback view;
// everything else still opens the editable builder.
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
    <>
      <Header title="Mes business plans" />
      <div className="mb-6 flex justify-end">
        <Button href="/dashboard/business-plans/new">
          <Plus size={16} /> Nouveau plan
        </Button>
      </div>

      {loading && <p className="text-sm text-ink-soft">Chargement...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!loading && !error && plans.length === 0 && (
        <p className="text-sm text-ink-soft">Aucun business plan pour le moment.</p>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <Link
            key={p.id}
            href={linkFor(p)}
            className="card-surface block p-6 shadow-card transition-transform hover:-translate-y-1"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rise-gradient text-white">
              <FileText size={18} />
            </div>
            <h3 className="mb-2 font-display text-lg text-ink">{p.title}</h3>
            <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-sand-100">
              <div className="h-full rounded-full bg-rise-gradient" style={{ width: `${p.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-soft">{p.progress}% complété</p>

            {(p.status === "APPROVED" || p.status === "REJECTED") && p.reviewNotes && (
              <div className="mt-3 rounded-lg bg-sand-50 p-2">
                {p.reviewScore != null && (
                  <p className="text-[11px] font-semibold text-rose-600">{p.reviewScore}/100</p>
                )}
                <p className="text-xs text-ink-soft line-clamp-2">{p.reviewNotes}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}