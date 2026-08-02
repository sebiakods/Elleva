import { notFound } from "next/navigation";
import { CheckCircle2, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";
import financing from "@/data/financing.json";
import { formatDZD } from "@/lib/utils";

export function generateStaticParams() {
  return financing.map((f) => ({ slug: f.slug }));
}

export default async function FinancingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = financing.find((f) => f.slug === slug);
  if (!program) return notFound();

  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Badge tone="wine">{program.institution}</Badge>
            <h1 className="mt-4 font-display text-4xl text-ink">{program.title}</h1>
            <p className="mt-4 max-w-2xl text-ink-soft leading-relaxed">{program.description}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <Reveal className="grid gap-6 sm:grid-cols-2">
          <div className="card-surface shadow-card p-6">
            <p className="text-xs text-ink-soft">Montant disponible</p>
            <p className="font-display text-2xl text-ink">
              {formatDZD(program.amountMin)} – {formatDZD(program.amountMax)}
            </p>
          </div>
          <div className="card-surface shadow-card p-6">
            <p className="text-xs text-ink-soft">Taux / conditions</p>
            <p className="font-display text-2xl text-ink">{program.rate}</p>
          </div>
        </Reveal>

        <Reveal delay={100} className="card-surface mt-8 p-7 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-ink">
            <CheckCircle2 className="text-rose-500" size={20} /> Critères d&apos;éligibilité
          </h2>
          <ul className="space-y-2.5">
            {program.eligibility.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                {e}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200} className="card-surface mt-6 p-7 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-ink">
            <FileCheck2 className="text-wine-500" size={20} /> Documents requis
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {program.documents.map((d) => (
              <li key={d} className="rounded-lg bg-sand-50 px-3 py-2.5 text-sm text-ink-soft">
                {d}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={300} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/register" size="lg" className="flex-1">
            Postuler à ce programme
          </Button>
          <Button href="/financing" variant="outline" size="lg">
            Retour à l&apos;annuaire
          </Button>
        </Reveal>
      </section>
    </div>
  );
}
