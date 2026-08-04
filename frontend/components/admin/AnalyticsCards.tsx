import { LucideIcon, ArrowUpRight } from "lucide-react";

export function AnalyticsCards({
  items,
}: {
  items: { label: string; value: string; change: string; icon: LucideIcon }[];
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="card-surface p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <s.icon size={18} />
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight size={13} /> {s.change}
            </span>
          </div>
          <p className="font-display text-2xl text-ink">{s.value}</p>
          <p className="text-xs text-ink-soft">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
