"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const initialPlans = [
  {
    id: 1,
    title: "Atelier Lumière",
    owner: "Amina K.",
    status: "En attente",
    submitted: "28 juin 2026",
  },
  {
    id: 2,
    title: "Souk Bio",
    owner: "Yasmine B.",
    status: "Approuvé",
    submitted: "20 juin 2026",
  },
  {
    id: 3,
    title: "Nour Tech",
    owner: "Lina T.",
    status: "En révision",
    submitted: "15 juin 2026",
  },
];

const tone = {
  "En attente": "gold",
  "Approuvé": "rose",
  "En révision": "wine",
} as const;

export default function AdminBusinessPlansPage() {
  const [plans, setPlans] = useState(initialPlans);

  const reviewPlan = (id: number) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? { ...plan, status: "En révision" }
          : plan
      )
    );
  };

  const approvePlan = (id: number) => {
    const ok = window.confirm(
      "Voulez-vous approuver ce business plan ?"
    );

    if (!ok) return;

    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? { ...plan, status: "Approuvé" }
          : plan
      )
    );
  };

  return (
    <>
      <Header title="Révision des business plans" />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="card-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <Badge
                tone={tone[plan.status as keyof typeof tone]}
              >
                {plan.status}
              </Badge>

              <span className="text-xs text-ink-soft">
                {plan.submitted}
              </span>
            </div>

            <h3 className="mb-1 font-display text-lg text-ink">
              {plan.title}
            </h3>

            <p className="mb-5 text-sm text-ink-soft">
              Par {plan.owner}
            </p>

            <div className="flex gap-2">

              {plan.status === "En révision" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 opacity-60"
                >
                  En révision
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => reviewPlan(plan.id)}
                >
                  Réviser
                </Button>
              )}

              {plan.status === "Approuvé" ? (
                <Button
                  size="sm"
                  className="flex-1 opacity-60"
                >
                  ✓ Approuvé
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => approvePlan(plan.id)}
                >
                  Approuver
                </Button>
              )}

            </div>
          </div>
        ))}
      </div>
    </>
  );
}