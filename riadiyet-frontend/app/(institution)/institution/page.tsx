
import { Landmark, ClipboardList, CalendarDays, Users, TrendingUp, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";
import { Avatar } from "@/components/common/Avatar";

const recentApplications = [
  { name:"Amina Kaddour", program:"Crédit PME Femmes", submitted:"Il y a 2h", status:"submitted" as const },
  { name:"Yasmine Bensaid", program:"Crédit PME Femmes", submitted:"Hier", status:"under_review" as const },
  { name:"Lina Tabet", program:"Mourabaha Artisanat", submitted:"Il y a 2j", status:"approved" as const },
];
const statusMap = {
  submitted:   { label:"Reçue",       tone:"wine"    as const },
  under_review:{ label:"En révision", tone:"gold"    as const },
  approved:    { label:"Approuvée",   tone:"rose"    as const },
  rejected:    { label:"Refusée",     tone:"neutral" as const },
};

export default function InstitutionOverviewPage() {
  return (
    <>
      <Header title="Tableau de bord" />
      <Reveal>
        <StatsCards items={[
          { label:"Programmes actifs",    value:"4",  icon:Landmark,     tone:"rose" },
          { label:"Candidatures reçues",  value:"38", icon:ClipboardList, tone:"wine" },
          { label:"Événements à venir",   value:"2",  icon:CalendarDays,  tone:"gold" },
          { label:"Bénéficiaires totaux", value:"121",icon:Users,         tone:"rose" },
        ]}/>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Reveal delay={80} className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg text-ink">Candidatures récentes</h3>
            <Button href="/institution/applications" variant="ghost" size="sm">Tout voir</Button>
          </div>
          <ul className="divide-y divide-sand-100">
            {recentApplications.map(a => {
              const s = statusMap[a.status];
              return (
                <li key={a.name} className="flex items-center gap-3 py-3">
                  <Avatar name={a.name} size="sm"/>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm">{a.name}</p>
                    <p className="text-xs text-ink-soft truncate">{a.program}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <span className="text-xs text-ink-soft hidden sm:inline flex items-center gap-1">
                      <Clock size={11}/>{a.submitted}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={120} className="card-surface p-6 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">Répartition des candidatures</h3>
          <div className="space-y-4">
            {[
              { label:"Approuvées", value:62, tone:"rose" },
              { label:"En révision",value:23, tone:"gold" },
              { label:"En attente", value:15, tone:"wine" },
            ].map(r => (
              <div key={r.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink">{r.label}</span>
                  <span className="font-semibold text-ink">{r.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                  <div className="h-full rounded-full bg-rise-gradient" style={{ width:`${r.value}%` }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <Button href="/institution/applications" variant="secondary" size="sm" className="flex-1">Voir les candidatures</Button>
            <Button href="/institution/reports" variant="outline" size="sm" className="flex-1">
              <TrendingUp size={14}/> Rapport
            </Button>
          </div>
        </Reveal>
      </div>
    </>
  );
}
