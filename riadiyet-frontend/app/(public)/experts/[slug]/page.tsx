import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";
import experts from "@/data/experts.json";

export function generateStaticParams() {
  return experts.map((e) => ({ slug: e.slug }));
}

export default async function ExpertPublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) return notFound();

  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h1 className="font-display text-4xl text-ink">{expert.name}</h1>
            <p className="mt-2 text-ink-soft">{expert.title}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <div className="card-surface shadow-card">
          <EmptyState
            icon={GraduationCap}
            title="Profil complet de l'experte"
            description="Bio détaillée, spécialités, cours, articles, avis et réservation de session — implémentation complète à l'étape 5."
            action={{ label: "Retour à l'annuaire", href: "/experts" }}
          />
        </div>
      </section>
    </div>
  );
}