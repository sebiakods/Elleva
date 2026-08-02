"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Plus, Search, Eye, Clock, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

const VIDEOS = [
  { id:"1", title:"Introduction au financement bancaire en Algérie", duration:"18:24", views:520, category:"Financement", published:true, date:"10 juin 2026" },
  { id:"2", title:"Comment pitcher votre projet devant un investisseur", duration:"24:10", views:890, category:"Entrepreneuriat", published:true, date:"28 mai 2026" },
  { id:"3", title:"Maîtriser le seuil de rentabilité", duration:"12:05", views:0, category:"Finance", published:false, date:"En cours" },
];

export default function ExpertVideosPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = VIDEOS.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Mes vidéos" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
          <Search size={15} className="text-ink-soft" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une vidéo…"
            className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full" />
        </div>
        <Button onClick={() => router.push("/expert/videos/create")}>
          <Plus size={16}/>
          Ajouter une vidéo
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface shadow-card">
          <EmptyState
            icon={Video}
            title="Aucune vidéo trouvée"
            description="Publiez votre première vidéo ou tutoriel."
            action={{
              label: "Ajouter une vidéo",
              onClick: () => router.push("/expert/videos/create"),
            }}
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v, i) => (
            <Reveal delay={i * 60} key={v.id}>
              <div className="card-surface shadow-card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-40 bg-wine-900 flex items-center justify-center">
                  <Video size={36} className="text-rose-400"/>
                  <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white font-mono">
                    {v.duration}
                  </span>
                  {!v.published && (
                    <span className="absolute top-2 left-2">
                      <Badge tone="neutral">Brouillon</Badge>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <Badge tone="rose" className="mb-2">{v.category}</Badge>
                  <h3 className="font-display text-sm text-ink leading-snug mb-2">{v.title}</h3>
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span className="flex items-center gap-1"><Eye size={11}/>{v.views} vues</span>
                    <span className="flex items-center gap-1"><Clock size={11}/>{v.date}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Pencil size={13}/> Modifier
                    </Button>
                    <button className="rounded-full p-2 text-rose-400 hover:bg-rose-50 focus-ring">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}