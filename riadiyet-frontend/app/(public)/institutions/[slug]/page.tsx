import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";
import institutions from "@/data/institutions.json";

export function generateStaticParams() {
  return institutions.map((i) => ({ slug: i.slug }));
}

export default async function InstitutionPublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = institutions.find((i) => i.slug === slug);
  if (!institution) return notFound();

  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h1 className="font-display text-4xl text-ink">{institution.name}</h1>
            <p className="mt-2 text-ink-soft">{institution.description}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <div className="card-surface shadow-card">
          <EmptyState
            icon={Building2}
            title="Profil complet de l'institution"
            description="Programmes publiés, événements, documents requis et formulaire de contact — implémentation complète à l'étape 5."
            action={{ label: "Retour aux institutions", href: "/institutions" }}
          />
        </div>
      </section>
    </div>
  );
}