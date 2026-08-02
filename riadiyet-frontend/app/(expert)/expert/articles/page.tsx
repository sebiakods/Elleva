"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, Plus, Search, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

const ARTICLES = [
  { id:"1", title:"Comment choisir entre ANADE et ANSEJ ?", category:"Financement", readTime:"6 min", views:840, date:"12 juin 2026", published:true },
  { id:"2", title:"Les 5 erreurs dans un business plan", category:"Business Plan", readTime:"8 min", views:1240, date:"3 juin 2026", published:true },
  { id:"3", title:"Finance islamique : guide pratique pour les startups", category:"Finance", readTime:"10 min", views:0, date:"En cours", published:false },
];

export default function ExpertArticlesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Mes articles" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
          <Search size={15} className="text-ink-soft" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un article…"
            className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full" />
        </div>
        <Button onClick={() => router.push("/expert/articles/create")}><Plus size={16}/>
            Rédiger un article</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface shadow-card">
          <EmptyState
            icon={Newspaper}
            title="Aucun article trouvé"
            description="Publiez votre premier article pour partager votre expertise."
            action={{
              label: "Rédiger un article",
              onClick: () => router.push("/expert/articles/create"),
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a, i) => (
            <Reveal delay={i * 60} key={a.id}>
              <div className="card-surface p-5 shadow-card flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <Newspaper size={20}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="rose">{a.category}</Badge>
                    {a.published
                      ? <Badge tone="wine">Publié</Badge>
                      : <Badge tone="neutral">Brouillon</Badge>}
                  </div>
                  <h3 className="font-display text-base text-ink">{a.title}</h3>
                  <div className="mt-1 flex items-center gap-4 text-xs text-ink-soft">
                    <span className="flex items-center gap-1"><Clock size={11}/>{a.readTime}</span>
                    <span className="flex items-center gap-1"><Eye size={11}/>{a.views} vues</span>
                    <span>{a.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm"><Pencil size={13}/> Modifier</Button>
                  <button className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50 focus-ring">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}