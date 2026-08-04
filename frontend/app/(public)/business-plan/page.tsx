import { FileText, Share2, Download, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";

const steps = [
  { icon: ListChecks, title: "Résumé exécutif", text: "Présentez votre vision et vos objectifs en une page claire." },
  { icon: FileText, title: "Analyse de marché", text: "Étudiez votre secteur, vos concurrents et votre clientèle cible." },
  { icon: Download, title: "Plan financier", text: "Connectez vos calculateurs pour générer des projections automatiques." },
  { icon: Share2, title: "Partage & révision", text: "Envoyez votre plan à une mentore pour obtenir des retours détaillés." },
];

export default function BusinessPlanLanding() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Business Plan Builder</p>
            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              Un plan d&apos;affaires <span className="text-gradient-rise">guidé</span>, étape par étape
            </h1>
            <p className="mt-5 max-w-lg text-ink-soft leading-relaxed">
              Construisez un business plan professionnel sans expérience préalable. Exportez-le en PDF et partagez-le avec votre mentore.
            </p>
            <Button href="/register" size="lg" className="mt-8">
              Commencer mon plan
            </Button>
          </Reveal>
          <Reveal delay={150} className="card-surface shadow-bloom p-7">
            <div className="space-y-3">
              {["Résumé exécutif", "Étude de marché", "Stratégie marketing", "Plan financier"].map((s, i) => (
                <div key={s} className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rise-gradient text-xs text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-ink">{s}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal delay={i * 100} key={s.title} className="card-surface p-6 shadow-card">
              <s.icon className="mb-4 text-rose-500" size={26} />
              <h3 className="mb-2 font-display text-lg text-ink">{s.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
