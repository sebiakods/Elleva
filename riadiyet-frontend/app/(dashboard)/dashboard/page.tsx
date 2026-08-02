import { FileText, Heart, Calculator, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function DashboardHome() {
  return (
    <>
      <Header title="Bonjour, Amina 👋" />

      <StatsCards
        items={[
          { label: "Business plans", value: "3", icon: FileText, tone: "rose" },
          { label: "Programmes favoris", value: "7", icon: Heart, tone: "wine" },
          { label: "Simulations effectuées", value: "12", icon: Calculator, tone: "gold" },
          { label: "Progression globale", value: "68%", icon: TrendingUp, tone: "rose" },
        ]}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <NotificationPanel />
        </div>
      </div>
    </>
  );
}
