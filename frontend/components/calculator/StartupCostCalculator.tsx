"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { formatDZD } from "@/lib/utils";

const defaultItems = [
  { label: "Local / loyer", value: 80000 },
  { label: "Équipement", value: 250000 },
  { label: "Stock initial", value: 150000 },
  { label: "Licences & enregistrement", value: 40000 },
  { label: "Marketing de lancement", value: 60000 },
];

export function StartupCostCalculator() {
  const [items, setItems] = useState(defaultItems);
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        {items.map((item, idx) => (
          <Input
            key={item.label}
            label={item.label}
            type="number"
            value={item.value}
            onChange={(e) => {
              const next = [...items];
              next[idx] = { ...item, value: Number(e.target.value) };
              setItems(next);
            }}
          />
        ))}
      </div>
      <div className="rounded-2xl bg-rise-gradient p-7 text-white">
        <p className="text-sm text-white/80">Coût total de démarrage</p>
        <p className="font-display text-4xl">{formatDZD(total)}</p>
        <ul className="mt-6 space-y-2 border-t border-white/20 pt-5 text-sm">
          {items.map((i) => (
            <li key={i.label} className="flex justify-between text-white/85">
              <span>{i.label}</span>
              <span>{formatDZD(i.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

