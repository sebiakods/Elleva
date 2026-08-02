import { Plus, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const categories = [
  { name: "Prêt bancaire", count: 12, slug: "bank-loan" },
  { name: "Finance islamique", count: 8, slug: "islamic-finance" },
  { name: "Aide gouvernementale", count: 15, slug: "government-grant" },
  { name: "Financement startup", count: 6, slug: "startup-funding" },
];

export default function AdminCategoriesPage() {
  return (
    <>
      <Header title="Catégories" />
      <div className="mb-5 flex justify-end">
                <Link href="/admin/categories/new">
          <Button>
            <Plus size={16} />
            Nouvelle catégorie
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((c) => (
          <div key={c.slug} className="card-surface flex items-center justify-between p-5 shadow-card">
            <div>
              <p className="font-semibold text-ink">{c.name}</p>
              <p className="text-xs text-ink-soft">{c.count} programmes</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full p-1.5 text-ink-soft hover:bg-sand-100 focus-ring"><Pencil size={15} /></button>
              <button className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50 focus-ring"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
