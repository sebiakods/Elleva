"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { formatDZD } from "@/lib/utils";

export function ROICalculator() {
  const [investment, setInvestment] = useState(1000000);
  const [netReturn, setNetReturn] = useState(1350000);

  const roi = useMemo(() => ((netReturn - investment) / investment) * 100, [investment, netReturn]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-5">
        <Input label="Investissement initial (DA)" type="number" value={investment} onChange={(e) => setInvestment(Number(e.target.value))} />
        <Input label="Gain total généré (DA)" type="number" value={netReturn} onChange={(e) => setNetReturn(Number(e.target.value))} />
      </div>
      <div className="rounded-2xl bg-rose-50 p-7">
        <p className="text-sm text-rose-600">Retour sur investissement (ROI)</p>
        <p className="font-display text-4xl text-rose-700">{roi.toFixed(1)}%</p>
        <div className="mt-6 border-t border-rose-100 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Bénéfice net</span>
            <span className="font-semibold text-ink">{formatDZD(netReturn - investment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

