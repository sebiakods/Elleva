import { Plus, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const plans = [
  { id: "1", title: "Atelier Lumière — Bougies artisanales", status: "Brouillon", progress: 40 },
  { id: "2", title: "Souk Bio — Épicerie en ligne", status: "Soumis", progress: 100 },
  { id: "3", title: "Nour Tech — Application mobile", status: "Révisé", progress: 85 },
];

const statusTone = { Brouillon: "neutral", Soumis: "wine", Révisé: "rose" } as const;

export default function BusinessPlansListPage() {
  return (
    <>
      <Header title="Mes business plans" />
      <div className="mb-6 flex justify-end">
        <Button href="/dashboard/business-plans/new">
          <Plus size={16} /> Nouveau plan
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <a key={p.id} href={`/dashboard/business-plans/${p.id}`} className="card-surface block p-6 shadow-card transition-transform hover:-translate-y-1">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rise-gradient text-white">
              <FileText size={18} />
            </div>
            <h3 className="mb-2 font-display text-lg text-ink">{p.title}</h3>
            <Badge tone={statusTone[p.status as keyof typeof statusTone]}>{p.status}</Badge>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-sand-100">
              <div className="h-full rounded-full bg-rise-gradient" style={{ width: `${p.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-soft">{p.progress}% complété</p>
          </a>
        ))}
      </div>
    </>
  );
}
