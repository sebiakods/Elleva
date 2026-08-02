import { Users, Landmark, FileText, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { Charts } from "@/components/admin/Charts";
import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminOverviewPage() {
  return (
    <>
      <Header title="Tableau de bord — Admin" />

      <AnalyticsCards
        items={[
          { label: "Utilisateurs actifs", value: "2 418", change: "+12%", icon: Users },
          { label: "Programmes publiés", value: "48", change: "+3%", icon: Landmark },
          { label: "Business plans soumis", value: "312", change: "+18%", icon: FileText },
          { label: "Taux de complétion", value: "74%", change: "+5%", icon: TrendingUp },
        ]}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Charts />
        <div className="card-surface p-6 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">Répartition des rôles</h3>
          <div className="space-y-4">
            {[
              { label: "Entrepreneures", count: 2280, pct: 94 },
              { label: "Mentores", count: 95, pct: 4 },
              { label: "Institutions", count: 43, pct: 2 },
            ].map((r) => (
              <div key={r.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink">{r.label}</span>
                  <span className="font-semibold text-ink">{r.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                  <div className="h-full rounded-full bg-rise-gradient" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl text-ink">Derniers utilisateurs inscrits</h2>
        <UsersTable />
      </div>
    </>
  );
}
