import { Heart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import financing from "@/data/financing.json";
import { formatDZD } from "@/lib/utils";

export default function FavoritesPage() {
  const favorites = financing.slice(0, 3);
  return (
    <>
      <Header title="Programmes favoris" />
      <div className="grid gap-5 md:grid-cols-2">
        {favorites.map((f) => (
          <div key={f.slug} className="card-surface p-6 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <Badge tone="rose">{f.institution}</Badge>
              <Heart size={18} className="fill-rose-500 text-rose-500" />
            </div>
            <h3 className="mb-2 font-display text-lg text-ink">{f.title}</h3>
            <p className="mb-4 text-sm text-ink-soft">
              {formatDZD(f.amountMin)} – {formatDZD(f.amountMax)} · {f.rate}
            </p>
            <Button href={`/financing/${f.slug}`} variant="secondary" size="sm" className="w-full">
              Voir le détail
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
