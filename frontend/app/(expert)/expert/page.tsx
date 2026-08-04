
import {
  GraduationCap, Star, CalendarCheck, FileText,
  Users, MessageSquare, TrendingUp, Clock,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";

const upcomingSessions = [
  { name: "Amina Kaddour", topic: "Révision plan financier", date: "Auj. 15:00", avatar: undefined },
  { name: "Yasmine Bensaid", topic: "Stratégie marketing", date: "Dem. 10:30", avatar: undefined },
  { name: "Lina Tabet", topic: "Analyse de marché", date: "Jeu. 14:00", avatar: undefined },
];

const pendingReviews = [
  { title: "Atelier Lumière — Bougies artisanales", owner: "Amina K.", submitted: "Il y a 2h" },
  { title: "Souk Bio — Épicerie en ligne", owner: "Yasmine B.", submitted: "Hier" },
];

export default function ExpertOverviewPage() {
  return (
    <>
      <Header title="Bonjour, Dr. Leila 👋" />

      <Reveal>
        <StatsCards items={[
          { label: "Cours publiés",       value: "8",    icon: GraduationCap, tone: "rose" },
          { label: "Note moyenne",         value: "4.9 ★", icon: Star,          tone: "gold" },
          { label: "Sessions ce mois",     value: "24",   icon: CalendarCheck,  tone: "wine" },
          { label: "Plans en révision",    value: "2",    icon: FileText,       tone: "rose" },
        ]} />
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Sessions à venir */}
        <Reveal delay={80} className="lg:col-span-2">
          <div className="card-surface p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Sessions à venir</h3>
              <Button href="/expert/sessions" variant="ghost" size="sm">Tout voir</Button>
            </div>
            <ul className="divide-y divide-sand-100">
              {upcomingSessions.map((s) => (
                <li key={s.name} className="flex items-center gap-4 py-3">
                  <Avatar name={s.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm">{s.name}</p>
                    <p className="truncate text-xs text-ink-soft">{s.topic}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="wine">{s.date}</Badge>
                    <Button size="sm" variant="secondary">Rejoindre</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Business plans en attente */}
        <Reveal delay={160}>
          <div className="card-surface p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Plans en attente</h3>
              <Button href="/expert/business-plans" variant="ghost" size="sm">Voir tout</Button>
            </div>
            <ul className="space-y-3">
              {pendingReviews.map((r) => (
                <li key={r.title} className="rounded-xl bg-sand-50 p-4">
                  <p className="text-sm font-medium text-ink leading-snug">{r.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-ink-soft">Par {r.owner}</span>
                    <span className="text-xs text-ink-soft flex items-center gap-1">
                      <Clock size={11} />{r.submitted}
                    </span>
                  </div>
                  <Button href="/expert/business-plans" size="sm" className="mt-3 w-full" variant="outline">
                    Réviser
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Quick stats row */}
      <Reveal delay={200} className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Entrepreneures accompagnées", value: "47" },
          { icon: MessageSquare, label: "Messages non lus", value: "3" },
          { icon: TrendingUp, label: "Vues de cours ce mois", value: "1 240" },
        ].map((s) => (
          <div key={s.label} className="card-surface flex items-center gap-4 p-5 shadow-card">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <s.icon size={20} />
            </div>
            <div>
              <p className="font-display text-2xl text-ink">{s.value}</p>
              <p className="text-xs text-ink-soft">{s.label}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </>
  );
}