import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

export default function InstitutionsDirectoryPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Partenaires financiers</p>
            <h1 className="font-display text-4xl text-ink">Annuaire des institutions</h1>
            <p className="mt-3 max-w-xl text-ink-soft">
              Banques, organismes publics, incubateurs et investisseurs partenaires d&apos;Ellevadz.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="card-surface shadow-card">
          <EmptyState
            icon={Building2}
            title="Annuaire des institutions"
            description="La liste des institutions avec recherche, filtres par type et accès aux programmes — implémentation complète à l'étape 5."
          />
        </div>
      </section>
    </div>
  );
}