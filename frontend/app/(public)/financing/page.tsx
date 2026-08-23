import { Search, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";
import financing from "@/data/financing.json";
import { FINANCING_CATEGORIES } from "@/lib/constants";
import { formatDZD } from "@/lib/utils";

const categoryLabel = (slug: string) =>
  FINANCING_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

export default function FinancingPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Annuaire</p>
            <h1 className="font-display text-4xl text-ink">Programmes de financement</h1>
            <p className="mt-3 max-w-xl text-ink-soft">
              Explorez les opportunités bancaires, islamiques, gouvernementales et startup, filtrées selon votre profil.
            </p>
          </Reveal>

          <Reveal delay={100} className="card-surface mt-8 flex flex-col gap-3 p-3 shadow-card sm:flex-row">
            <div className="flex flex-1 items-center gap-3 px-4 py-3">
              <Search size={18} className="text-ink-soft" />
              <input
                placeholder="Rechercher une institution, un secteur…"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-soft/60"
              />
            </div>
            <Button variant="outline">
              <SlidersHorizontal size={16} /> Filtres
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8 flex flex-wrap gap-2">
          {["Tous", ...FINANCING_CATEGORIES.map((c) => c.label)].map((c, i) => (
            <button
              key={c}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                i === 0 ? "bg-rise-gradient text-white" : "bg-white text-ink-soft hover:bg-rose-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {financing.map((f, i) => (
            <Reveal delay={i * 80} key={f.slug}>
              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <Badge tone="rose">{categoryLabel(f.category)}</Badge>
                  <span className="text-xs text-ink-soft">{f.institution}</span>
                </div>
                <h3 className="mb-2 font-display text-xl text-ink">{f.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-ink-soft">{f.description}</p>
                <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-sand-50 p-4 text-sm">
                  <div>
                    <p className="text-xs text-ink-soft">Montant</p>
                    <p className="font-semibold text-ink">
                      {formatDZD(f.amountMin)} – {formatDZD(f.amountMax)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft">Taux</p>
                    <p className="font-semibold text-ink">{f.rate}</p>
                  </div>
                </div>
                <Button href={`/financing/${f.slug}`} variant="secondary" className="w-full">
                  Voir le programme
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

