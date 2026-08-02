"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { formatDZD } from "@/lib/utils";

export function LoanCalculator() {
  const [amount, setAmount] = useState(2000000);
  const [rate, setRate] = useState(6);
  const [months, setMonths] = useState(36);

  const monthly = useMemo(() => {
    const r = rate / 100 / 12;
    if (r === 0) return amount / months;
    return (amount * r) / (1 - Math.pow(1 + r, -months));
  }, [amount, rate, months]);

  const total = monthly * months;
  const interest = total - amount;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-5">
        <Input
          label="Montant du prêt (DA)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <Input
          label="Taux d'intérêt annuel (%)"
          type="number"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
        />
        <Input
          label="Durée (mois)"
          type="number"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
        />
      </div>

      <div className="rounded-2xl bg-rise-gradient p-7 text-white">
        <p className="text-sm text-white/80">Mensualité estimée</p>
        <p className="font-display text-4xl">{formatDZD(Math.round(monthly))}</p>
        <div className="mt-6 space-y-3 border-t border-white/20 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-white/80">Coût total du crédit</span>
            <span className="font-semibold">{formatDZD(Math.round(total))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Intérêts totaux</span>
            <span className="font-semibold">{formatDZD(Math.round(interest))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
