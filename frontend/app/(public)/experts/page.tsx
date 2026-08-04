import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

export default function ExpertsDirectoryPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Trouvez votre guide</p>
            <h1 className="font-display text-4xl text-ink">Annuaire des expertes</h1>
            <p className="mt-3 max-w-xl text-ink-soft">
              Connectez-vous avec des consultantes, mentores et conseillères vérifiées pour accélérer votre projet.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="card-surface shadow-card">
          <EmptyState
            icon={GraduationCap}
            title="Annuaire des expertes"
            description="La liste complète des expertes avec recherche, filtres par spécialité et réservation de session sera implémentée à l'étape 5."
          />
        </div>
      </section>
    </div>
  );
}