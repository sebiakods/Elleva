import { Plus, Calculator, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function QuickActions() {
  return (
    <div className="card-surface p-6 shadow-card">
      <h3 className="mb-4 font-display text-lg text-ink">Actions rapides</h3>
      <div className="space-y-3">
        <Button href="/dashboard/business-plans/new" className="w-full justify-start" variant="secondary">
          <Plus size={16} /> Nouveau business plan
        </Button>
        <Button href="/dashboard/calculators" className="w-full justify-start" variant="ghost">
          <Calculator size={16} /> Ouvrir un calculateur
        </Button>
        <Button href="/financing" className="w-full justify-start" variant="ghost">
          <Search size={16} /> Explorer les financements
        </Button>
      </div>
    </div>
  );
}

