"use client";
import { useEffect, useState } from "react";
import { getPlan, BusinessPlan } from "@/lib/api/businessPlans";

export function Preview({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlan(planId)
      .then(setPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) {
    return <div className="mx-auto max-w-2xl card-surface p-10 shadow-card text-sm text-ink-soft">Chargement...</div>;
  }
  if (error || !plan) {
    return <div className="mx-auto max-w-2xl card-surface p-10 shadow-card text-sm text-rose-600">{error || "Plan introuvable"}</div>;
  }

  const es = (plan.executiveSummary ?? {}) as any;
  const ma = (plan.marketAnalysis ?? {}) as any;
  const st = (plan.strategy ?? {}) as any;
  const fp = (plan.financialPlan ?? {}) as any;

  const sections = [
    {
      title: "Résumé exécutif",
      text: [es.sector && `Secteur : ${es.sector}.`, es.vision].filter(Boolean).join(" ") || "Non renseigné.",
    },
    {
      title: "Analyse de marché",
      text:
        [
          ma.targetAudience && `Clientèle cible : ${ma.targetAudience}.`,
          ma.competitors && `Concurrents : ${ma.competitors}.`,
        ]
          .filter(Boolean)
          .join(" ") || "Non renseigné.",
    },
    {
      title: "Stratégie",
      text:
        [
          st.channels && `Canaux de distribution : ${st.channels}.`,
          st.marketing && `Marketing : ${st.marketing}.`,
        ]
          .filter(Boolean)
          .join(" ") || "Non renseigné.",
    },
    {
      title: "Plan financier",
      text:
        [
          fp.initialInvestment && `Investissement initial : ${fp.initialInvestment} DA.`,
          fp.revenueYear1 && `Chiffre d'affaires prévisionnel an 1 : ${fp.revenueYear1} DA.`,
        ]
          .filter(Boolean)
          .join(" ") || "Non renseigné.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl card-surface p-10 shadow-card">
      <p className="font-script text-3xl text-rose-500">Ellevadz</p>
      <h1 className="mt-4 font-display text-3xl text-ink">{plan.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Business Plan — généré le {new Date().toLocaleDateString("fr-FR")}
      </p>

      {plan.reviewNotes && (
        <div className="mt-6 rounded-xl bg-rose-50 p-4">
          <p className="text-xs font-semibold text-rose-700">Retour de l'experte {plan.reviewScore != null && `— ${plan.reviewScore}/100`}</p>
          <p className="mt-1 text-sm text-rose-700">{plan.reviewNotes}</p>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} className="mt-8 border-t border-sand-100 pt-6">
          <h2 className="mb-2 font-display text-lg text-ink">{section.title}</h2>
          <p className="text-sm leading-relaxed text-ink-soft">{section.text}</p>
        </div>
      ))}
    </div>
  );
}