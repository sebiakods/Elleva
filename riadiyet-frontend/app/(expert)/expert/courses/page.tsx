"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Star,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

const COURSES = [
  {
    id: "1",
    title: "Comprendre les dispositifs ANADE & ANSEJ",
    category: "Financement",
    level: "Débutant",
    lessons: 6,
    enrolled: 142,
    rating: 4.8,
    published: true,
  },
  {
    id: "2",
    title: "Construire un Business Plan solide",
    category: "Business Plan",
    level: "Intermédiaire",
    lessons: 9,
    enrolled: 87,
    rating: 4.9,
    published: true,
  },
  {
    id: "3",
    title: "Finance islamique : principes et produits",
    category: "Financement",
    level: "Débutant",
    lessons: 5,
    enrolled: 61,
    rating: 4.7,
    published: false,
  },
];

const levelTone: Record<string, "rose" | "wine" | "gold"> = {
  Débutant: "rose",
  Intermédiaire: "gold",
  Avancé: "wine",
};

export default function ExpertCoursesPage() {
  const router = useRouter(); // ✅ Must be inside the component

  const [search, setSearch] = useState("");

  const filtered = COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Mes cours" />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-xs items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2">
          <Search size={15} className="text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60"
          />
        </div>

        <Button onClick={() => router.push("/expert/courses/create")}>
          <Plus size={16} />
          Créer un cours
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Reveal>
          <div className="card-surface shadow-card">
            <EmptyState
              icon={GraduationCap}
              title="Aucun cours trouvé"
              description="Créez votre premier cours pour partager votre expertise avec les entrepreneures."
              action={{
                label: "Créer un cours",
                onClick: () => router.push("/expert/courses/create"),
              }}
            />
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <div className="card-surface shadow-card flex h-full flex-col transition-transform duration-300 hover:-translate-y-1">
                <div className="bg-rise-gradient-soft flex h-36 items-center justify-center rounded-t-xl2">
                  <GraduationCap size={40} className="text-rose-400" />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge tone={levelTone[c.level] ?? "rose"}>
                      {c.level}
                    </Badge>

                    <Badge tone={c.published ? "rose" : "neutral"}>
                      {c.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>

                  <h3 className="mb-1 flex-1 font-display text-base leading-snug text-ink">
                    {c.title}
                  </h3>

                  <p className="mb-3 text-xs text-ink-soft">
                    {c.category}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-sand-100 pt-3 text-xs text-ink-soft">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {c.enrolled}
                    </span>

                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {c.lessons} leçons
                    </span>

                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-gold-400" />
                      {c.rating}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      <Pencil size={13} />
                      Modifier
                    </Button>

                    <button
                      type="button"
                      className="focus-ring rounded-full p-2 text-rose-400 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
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