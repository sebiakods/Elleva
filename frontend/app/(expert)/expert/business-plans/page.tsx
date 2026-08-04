"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Clock, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Reveal } from "@/components/common/Reveal";

const PLANS = [
  { id:"1", title:"Atelier Lumière — Bougies artisanales", owner:"Amina Kaddour", submitted:"Il y a 2h", status:"pending" as const, score: undefined },
  { id:"2", title:"Souk Bio — Épicerie en ligne", owner:"Yasmine Bensaid", submitted:"Hier", status:"in_review" as const, score: undefined },
  { id:"3", title:"Nour Tech — Application mobile", owner:"Lina Tabet", submitted:"Il y a 5j", status:"completed" as const, score:82 },
  { id:"4", title:"La Belle Couture — Mode locale", owner:"Sara Khelil", submitted:"Il y a 10j", status:"completed" as const, score:91 },
];

const statusMap = {
  pending:   { label:"En attente", tone:"gold" as const, icon:Clock },
  in_review: { label:"En révision", tone:"wine" as const, icon:MessageCircle },
  completed: { label:"Terminé", tone:"rose" as const, icon:CheckCircle2 },
};

function PlanCard({ plan }: { plan: typeof PLANS[0] }) {
  const router = useRouter();
  const s = statusMap[plan.status];
  return (
    <div className="card-surface p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={plan.owner} size="sm" />
          <div>
            <p className="font-semibold text-ink text-sm">{plan.owner}</p>
            <p className="text-xs text-ink-soft flex items-center gap-1">
              <Clock size={11}/>{plan.submitted}
            </p>
          </div>
        </div>
        <Badge tone={s.tone}>{s.label}</Badge>
      </div>
      <h3 className="mb-3 font-display text-base text-ink leading-snug">{plan.title}</h3>
      {plan.score !== undefined && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-sand-100 overflow-hidden">
            <div className="h-full rounded-full bg-rise-gradient" style={{ width:`${plan.score}%` }} />
          </div>
          <span className="text-sm font-semibold text-rose-600">{plan.score}/100</span>
        </div>
      )}
      <div className="flex gap-2">
        {plan.status !== "completed" && (


          <Button
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/expert/business-plans/${plan.id}`)}
          >
            Commencer la révision
          </Button>





        )}
        {plan.status === "completed" && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/expert/business-plans/${plan.id}`)}
            >
              Voir le rapport
            </Button>




            <button className="rounded-full p-2 text-rose-400 hover:bg-rose-50 focus-ring">
              <XCircle size={16}/>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ExpertBusinessPlansPage() {
  const [search, setSearch] = useState("");
  const filter = (status?: string) =>
    PLANS.filter(p =>
      (!status || p.status === status) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
       p.owner.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <>
      <Header title="Révisions de Business Plans" />
      <div className="mb-6 flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
        <Search size={15} className="text-ink-soft" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un plan…"
          className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full" />
      </div>

      <Tabs tabs={[
        {
          label: `En attente (${filter("pending").length})`,
          content: filter("pending").length === 0
            ? <div className="card-surface shadow-card"><EmptyState icon={FileText} title="Aucun plan en attente" description="Vous êtes à jour ! Aucun business plan ne nécessite votre attention pour le moment." /></div>
            : <div className="grid gap-5 md:grid-cols-2">{filter("pending").map(p => <Reveal key={p.id}><PlanCard plan={p}/></Reveal>)}</div>,
        },
        {
          label: `En révision (${filter("in_review").length})`,
          content: <div className="grid gap-5 md:grid-cols-2">{filter("in_review").map(p => <Reveal key={p.id}><PlanCard plan={p}/></Reveal>)}</div>,
        },
        {
          label: `Terminés (${filter("completed").length})`,
          content: <div className="grid gap-5 md:grid-cols-2">{filter("completed").map(p => <Reveal key={p.id}><PlanCard plan={p}/></Reveal>)}</div>,
        },
      ]} />
    </>
  );
}