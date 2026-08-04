import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "0 DA",
    period: "toujours",
    features: ["Accès à l'annuaire de financement", "1 business plan", "Calculateurs de base", "Articles & FAQ"],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "1 900 DA",
    period: "/ mois",
    features: ["Business plans illimités", "Export PDF avancé", "Accès mentorat prioritaire", "Tous les calculateurs", "Support dédié"],
    cta: "Choisir Premium",
    highlighted: true,
  },
  {
    name: "Institution",
    price: "Sur devis",
    period: "",
    features: ["Publication de programmes", "Tableau de bord institution", "Statistiques d'engagement", "Support dédié & API"],
    cta: "Nous contacter",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Nos offres</p>
            <h1 className="font-display text-4xl text-ink">Une formule pour chaque étape</h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal delay={i * 100} key={plan.name}>
              <div
                className={cn(
                  "h-full rounded-2xl p-8 transition-all duration-300",
                  plan.highlighted
                    ? "bg-rise-gradient text-white shadow-bloom scale-[1.03]"
                    : "card-surface shadow-card"
                )}
              >
                <h3 className={cn("font-display text-2xl", !plan.highlighted && "text-ink")}>{plan.name}</h3>
                <p className="mt-3">
                  <span className="font-display text-4xl">{plan.price}</span>{" "}
                  <span className={cn("text-sm", plan.highlighted ? "text-white/80" : "text-ink-soft")}>{plan.period}</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={16} className={cn("mt-0.5 shrink-0", plan.highlighted ? "text-white" : "text-rose-500")} />
                      <span className={plan.highlighted ? "text-white/90" : "text-ink-soft"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  href="/register"
                  variant={plan.highlighted ? "secondary" : "outline"}
                  className={cn("mt-8 w-full", plan.highlighted && "bg-white text-rose-600 hover:bg-sand-50")}
                >
                  {plan.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
