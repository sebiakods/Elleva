import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCards({
  items,
}: {
  items: { label: string; value: string; icon: LucideIcon; tone?: "rose" | "wine" | "gold" }[];
}) {
  const toneBg = { rose: "bg-rose-50 text-rose-600", wine: "bg-wine-50 text-wine-500", gold: "bg-amber-50 text-gold-500" };
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="card-surface p-5 shadow-card">
          <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", toneBg[s.tone ?? "rose"])}>
            <s.icon size={18} />
          </div>
          <p className="font-display text-2xl text-ink">{s.value}</p>
          <p className="text-xs text-ink-soft">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
