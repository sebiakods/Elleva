"use client";
import { useState } from "react";
import { Users, Search, TrendingUp, FileText, MessageSquare } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

const ENTREPRENEURS = [
  { id:"1", name:"Amina Kaddour", project:"Atelier Lumière", progress:72, stage:"Plan financier", sessions:3, plans:1, lastActive:"Auj." },
  { id:"2", name:"Yasmine Bensaid", project:"Souk Bio", progress:55, stage:"Étude de marché", sessions:5, plans:2, lastActive:"Hier" },
  { id:"3", name:"Lina Tabet", project:"Nour Tech", progress:88, stage:"Finalisation", sessions:8, plans:2, lastActive:"Il y a 2j" },
  { id:"4", name:"Sara Khelil", project:"La Belle Couture", progress:41, stage:"Résumé exécutif", sessions:1, plans:1, lastActive:"Il y a 5j" },
];

export default function ExpertEntrepreneursPage() {
  const [search, setSearch] = useState("");
  const filtered = ENTREPRENEURS.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.project.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Mes entrepreneures" />
      <div className="mb-6 flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
        <Search size={15} className="text-ink-soft" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une entrepreneure…"
          className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full" />
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface shadow-card">
          <EmptyState icon={Users} title="Aucune entrepreneure trouvée" description="Vous n'accompagnez encore personne. Les entrepreneures apparaîtront ici après avoir réservé une session avec vous." />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((e, i) => (
            <Reveal delay={i * 60} key={e.id}>
              <div className="card-surface p-5 shadow-card">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.name} size="md"/>
                    <div>
                      <p className="font-semibold text-ink">{e.name}</p>
                      <p className="text-xs text-ink-soft">{e.project}</p>
                    </div>
                  </div>
                  <Badge tone="neutral">Actif {e.lastActive}</Badge>
                </div>

                <div className="mb-1 flex items-center justify-between text-xs text-ink-soft">
                  <span className="flex items-center gap-1"><TrendingUp size={11}/>{e.stage}</span>
                  <span>{e.progress}%</span>
                </div>
                <div className="mb-4 h-2 rounded-full bg-sand-100 overflow-hidden">
                  <div className="h-full rounded-full bg-rise-gradient transition-all duration-500" style={{ width:`${e.progress}%` }} />
                </div>

                <div className="mb-4 flex gap-4 text-xs text-ink-soft">
                  <span className="flex items-center gap-1"><FileText size={11}/>{e.plans} plan(s)</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11}/>{e.sessions} session(s)</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">Voir le profil</Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare size={13}/> Message
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}