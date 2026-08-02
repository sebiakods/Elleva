import { Reveal } from "@/components/common/Reveal";
import { Tabs } from "@/components/ui/Tabs";
import { LoanCalculator } from "@/components/calculator/LoanCalculator";
import { ROICalculator } from "@/components/calculator/ROICalculator";
import { BreakEvenCalculator } from "@/components/calculator/BreakEvenCalculator";
import { StartupCostCalculator } from "@/components/calculator/StartupCostCalculator";

export default function CalculatorsPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Outils financiers</p>
            <h1 className="font-display text-4xl text-ink">Simulez avant de décider</h1>
            <p className="mt-3 max-w-xl text-ink-soft">
              Quatre calculateurs pour évaluer la rentabilité, le coût et le financement de votre projet.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <Reveal className="card-surface p-8 shadow-card">
          <Tabs
            tabs={[
              { label: "Prêt", content: <LoanCalculator /> },
              { label: "ROI", content: <ROICalculator /> },
              { label: "Seuil de rentabilité", content: <BreakEvenCalculator /> },
              { label: "Coût de démarrage", content: <StartupCostCalculator /> },
            ]}
          />
        </Reveal>
      </section>
    </div>
  );
}
