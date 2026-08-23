"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, Search, Download, FileText, Table2, Presentation, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

const typeIcon: Record<string, React.ElementType> = {
  pdf: FileText, spreadsheet: Table2, template: FileText, presentation: Presentation, other: FolderOpen,
};
const typeTone: Record<string, "rose"|"wine"|"gold"|"neutral"> = {
  pdf:"rose", spreadsheet:"wine", template:"gold", presentation:"rose", other:"neutral",
};

const RESOURCES = [
  { id:"1", title:"Template Business Plan complet", type:"template", downloads:210, size:"145 Ko", published:true, date:"5 juin 2026" },
  { id:"2", title:"Tableau de bord financier Excel", type:"spreadsheet", downloads:148, size:"88 Ko", published:true, date:"20 mai 2026" },
  { id:"3", title:"Guide ANADE 2026", type:"pdf", downloads:95, size:"2.1 Mo", published:true, date:"1 mai 2026" },
];

export default function ExpertResourcesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = RESOURCES.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Mes ressources" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
          <Search size={15} className="text-ink-soft" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une ressource…"
            className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full" />
        </div>
        <Button onClick={() => router.push("/expert/resources/create")} ><Plus size={16}/> Ajouter une ressource</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface shadow-card">
          <EmptyState
            icon={FolderOpen}
            title="Aucune ressource trouvée"
            description="Partagez des templates, guides et outils avec les entrepreneures."
            action={{
              label: "Ajouter une ressource",
              onClick: () => router.push("/expert/resources/create"),
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r, i) => {
            const Icon = typeIcon[r.type] ?? FolderOpen;
            return (
              <Reveal delay={i * 60} key={r.id}>
                <div className="card-surface p-5 shadow-card flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-ink-soft">
                    <Icon size={20}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink text-sm mb-1">{r.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-ink-soft">
                      <Badge tone={typeTone[r.type] ?? "neutral"}>{r.type}</Badge>
                      <span className="flex items-center gap-1"><Download size={11}/>{r.downloads}</span>
                      <span>{r.size}</span>
                      <span>{r.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="secondary" size="sm">Modifier</Button>
                    <button className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50 focus-ring">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </>
  );
}
