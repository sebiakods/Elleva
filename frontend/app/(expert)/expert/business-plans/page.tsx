"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Reveal } from "@/components/common/Reveal";
import { listSubmittedPlans, BusinessPlan, BusinessPlanStatus } from "@/lib/api/businessPlans";

const statusMap: Record<
  BusinessPlanStatus,
  { label: string; tone: "gold" | "wine" | "rose" | "neutral"; icon: typeof Clock }
> = {
  DRAFT:     { label: "Brouillon",  tone: "neutral", icon: Clock },
  SUBMITTED: { label: "En attente", tone: "gold",    icon: Clock },
  IN_REVIEW: { label: "En révision", tone: "wine",    icon: MessageCircle },
  APPROVED:  { label: "Approuvé",   tone: "rose",    icon: CheckCircle2 },
  REJECTED:  { label: "Rejeté",     tone: "neutral", icon: CheckCircle2 },
};

function formatRelative(dateStr: string) {
  if (!dateStr) return "Inconnu";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diffMs)) return "Inconnu";
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Hier" : `Il y a ${d}j`;
}

function PlanCard({ plan }: { plan: BusinessPlan }) {
  const router = useRouter();
  const s = statusMap[plan.status];
  
  return (
    <div className="card-surface p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={plan.owner?.name ?? "?"} size="sm" />
          <div>
            <p className="font-semibold text-ink text-sm">{plan.owner?.name ?? "Anonyme"}</p>
            <p className="text-xs text-ink-soft flex items-center gap-1">
              <Clock size={11} />
              {formatRelative(plan.updatedAt)}
            </p>
          </div>
        </div>
        <Badge tone={s.tone}>{s.label}</Badge>
      </div>

      <h3 className="mb-3 font-display text-base text-ink leading-snug">{plan.title}</h3>

      {plan.reviewScore != null && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-sand-100 overflow-hidden">
            <div className="h-full rounded-full bg-rise-gradient" style={{ width: `${plan.reviewScore}%` }} />
          </div>
          <span className="text-sm font-semibold text-rose-600">{plan.reviewScore}/100</span>
        </div>
      )}

      <Button
        size="sm"
        variant={plan.status === "APPROVED" || plan.status === "REJECTED" ? "secondary" : "primary"}
        className="w-full"
        onClick={() => router.push(`/expert/business-plans/${plan.id}`)}
      >
        {plan.status === "APPROVED" || plan.status === "REJECTED" ? "Voir le rapport" : "Commencer la révision"}
      </Button>
    </div>
  );
}

export default function ExpertBusinessPlansPage() {
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<BusinessPlan[]>([]);
  const [completed, setCompleted] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listSubmittedPlans("pending"), listSubmittedPlans("completed")])
      .then(([p, c]) => {
        setPending(p.items);
        setCompleted(c.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const matches = (p: BusinessPlan) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.owner?.name ?? "").toLowerCase().includes(search.toLowerCase());

  const pendingList = filterByStatus("SUBMITTED");
  const inReviewList = filterByStatus("IN_REVIEW");
  const completedList = filterCompleted();

  function filterByStatus(status: BusinessPlanStatus) {
    return pending.filter((p) => p.status === status).filter(matches);
  }

  function filterCompleted() {
    return completed.filter(matches);
  }

  if (loading) {
    return (
      <>
        <Header title="Révisions de Business Plans" />
        <p className="text-sm text-ink-soft">Chargement...</p>
      </>
    );
  }

  return (
    <>
      <Header title="Révisions de Business Plans" />

      <div className="mb-6 flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
        <Search size={15} className="text-ink-soft" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un plan…"
          className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full"
        />
      </div>

      <Tabs
        tabs={[
          {
            label: `En attente (${pendingList.length})`,
            content:
              pendingList.length === 0 ? (
                <div className="card-surface shadow-card">
                  <EmptyState
                    icon={FileText}
                    title="Aucun plan en attente"
                    description="Vous êtes à jour ! Aucun business plan ne nécessite votre attention pour le moment."
                  />
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
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
                <div className="card-surface shadow-card">
                  <EmptyState
                    icon={FileText}
                    title="Aucun plan en révision"
                    description="Vous n'avez aucun business plan en cours de révision."
                  />
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
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
                <div className="card-surface shadow-card">
                  <EmptyState
                    icon={FileText}
                    title="Aucun plan terminé"
                    description="Aucun business plan n'a encore été révisé."
                  />
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
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
    </>
  );
}