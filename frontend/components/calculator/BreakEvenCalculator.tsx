"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { formatDZD } from "@/lib/utils";

export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(300000);
  const [pricePerUnit, setPricePerUnit] = useState(1500);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(700);

  const margin = pricePerUnit - variableCostPerUnit;
  const breakEvenUnits = margin > 0 ? Math.ceil(fixedCosts / margin) : 0;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-5">
        <Input label="Charges fixes mensuelles (DA)" type="number" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} />
        <Input label="Prix de vente unitaire (DA)" type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} />
        <Input label="Coût variable unitaire (DA)" type="number" value={variableCostPerUnit} onChange={(e) => setVariableCostPerUnit(Number(e.target.value))} />
      </div>
      <div className="rounded-2xl bg-wine-50 p-7">
        <p className="text-sm text-wine-500">Seuil de rentabilité</p>
        <p className="font-display text-4xl text-wine-700">{breakEvenUnits} unités</p>
        <div className="mt-6 space-y-3 border-t border-wine-100 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Chiffre d&apos;affaires correspondant</span>
            <span className="font-semibold text-ink">{formatDZD(breakEvenRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Marge par unité</span>
            <span className="font-semibold text-ink">{formatDZD(margin)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
