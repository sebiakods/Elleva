import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";
import financing from "@/data/financing.json";
import { formatDZD } from "@/lib/utils";
import { FINANCING_CATEGORIES } from "@/lib/constants";

const categoryLabel = (slug: string) =>
  FINANCING_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

export function ProgramTable() {
  return (
    <div className="overflow-x-auto card-surface shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-sand-200 bg-sand-50">
            {["Programme", "Institution", "Catégorie", "Montant max", "Actions"].map((h) => (
              <th key={h} className="px-5 py-3.5 font-semibold text-ink-soft">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {financing.map((f) => (
            <tr key={f.slug} className="border-b border-sand-100 last:border-0 hover:bg-rose-50/40 transition-colors">
              <td className="px-5 py-4 font-medium text-ink">{f.title}</td>
              <td className="px-5 py-4 text-ink-soft">{f.institution}</td>
              <td className="px-5 py-4">
                <Badge tone="wine">{categoryLabel(f.category)}</Badge>
              </td>
              <td className="px-5 py-4 text-ink">{formatDZD(f.amountMax)}</td>
              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <button className="rounded-full p-1.5 text-ink-soft hover:bg-sand-100 focus-ring">
                    <Pencil size={15} />
                  </button>
                  <button className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50 focus-ring">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
