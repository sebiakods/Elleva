"use client";
import { useState } from "react";
import { Stepper } from "@/components/business-plan/Stepper";
import { FormSection } from "@/components/business-plan/FormSection";
import { ProgressBar } from "@/components/business-plan/ProgressBar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const steps = ["Résumé", "Marché", "Stratégie", "Finances", "Révision"];

export function BusinessPlanBuilder({ initialTitle = "" }: { initialTitle?: string }) {
  const [current, setCurrent] = useState(0);
  const progress = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div className="card-surface p-7 shadow-card sm:p-9">
      <div className="mb-8">
        <Stepper steps={steps} current={current} />
      </div>
      <ProgressBar value={progress} />

      <div className="mt-8 min-h-[260px]">
        {current === 0 && (
          <FormSection title="Résumé exécutif" description="Présentez votre projet en quelques phrases.">
            <Input label="Nom du projet" defaultValue={initialTitle} placeholder="Ex: Atelier Lumière" />
            <Select label="Secteur d'activité" defaultValue="">
              <option value="" disabled>Sélectionnez un secteur</option>
              <option>Artisanat</option>
              <option>Commerce</option>
              <option>Technologie</option>
              <option>Services</option>
            </Select>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Vision du projet</span>
              <textarea rows={4} className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] outline-none focus-ring focus:border-rose-400" placeholder="Décrivez votre projet en quelques phrases…" />
            </label>
          </FormSection>
        )}
        {current === 1 && (
          <FormSection title="Analyse de marché" description="Décrivez votre cible et la concurrence.">
            <Input label="Clientèle cible" placeholder="Ex: Femmes 25-45 ans, zones urbaines" />
            <Input label="Principaux concurrents" placeholder="Ex: Marques locales similaires" />
          </FormSection>
        )}
        {current === 2 && (
          <FormSection title="Stratégie" description="Comment allez-vous atteindre vos clients ?">
            <Input label="Canaux de distribution" placeholder="Ex: Boutique en ligne, marchés locaux" />
            <Input label="Stratégie marketing" placeholder="Ex: Réseaux sociaux, bouche-à-oreille" />
          </FormSection>
        )}
        {current === 3 && (
          <FormSection title="Plan financier" description="Connectez vos calculateurs pour préremplir cette section.">
            <Input label="Investissement initial estimé (DA)" type="number" placeholder="0" />
            <Input label="Chiffre d'affaires prévisionnel an 1 (DA)" type="number" placeholder="0" />
          </FormSection>
        )}
        {current === 4 && (
          <FormSection title="Révision finale" description="Vérifiez votre plan avant de le soumettre à une mentore.">
            <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              Votre business plan est prêt à être exporté en PDF ou partagé avec une mentore pour révision.
            </p>
          </FormSection>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          className={current === 0 ? "invisible" : ""}
        >
          Précédent
        </Button>
        {current < steps.length - 1 ? (
          <Button onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}>
            Suivant
          </Button>
        ) : (
          <Button href="/dashboard/business-plans/1/preview">Aperçu PDF</Button>
        )}
      </div>
    </div>
  );
}
