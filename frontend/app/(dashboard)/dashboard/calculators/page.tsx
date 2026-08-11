"use client";

import { Reveal } from "@/components/common/Reveal";
import { Tabs } from "@/components/ui/Tabs";
import { LoanCalculator } from "@/components/calculator/LoanCalculator";
import { ROICalculator } from "@/components/calculator/ROICalculator";
import { BreakEvenCalculator } from "@/components/calculator/BreakEvenCalculator";
import { StartupCostCalculator } from "@/components/calculator/StartupCostCalculator";

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* HERO */}
      <section className="bg-rise-gradient-soft px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">
              Outils financiers
            </p>

            <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
              Simulez avant de décider
            </h1>

            <p className="mt-3 max-w-2xl text-ink-soft">
              Utilisez nos calculateurs pour évaluer la rentabilité,
              le coût et le financement de votre projet.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CALCULATORS */}
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-16">
        <Reveal className="card-surface p-6 shadow-card sm:p-8">
          <Tabs
            tabs={[
              {
                label: "Prêt",
                content: <LoanCalculator />,
              },
              {
                label: "ROI",
                content: <ROICalculator />,
              },
              {
                label: "Seuil de rentabilité",
                content: <BreakEvenCalculator />,
              },
              {
                label: "Coût de démarrage",
                content: <StartupCostCalculator />,
              },
            ]}
          />
        </Reveal>
      </section>
    </div>
  );
}

