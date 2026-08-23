import { Clock } from "lucide-react";

const activities = [
  { text: "Business plan « Atelier Lumière » mis à jour", time: "Il y a 2h" },
  { text: "Programme « Mourabaha Artisanat » ajouté aux favoris", time: "Hier" },
  { text: "Nouveau message de votre mentore", time: "Il y a 2 jours" },
];

export function RecentActivity() {
  return (
    <div className="card-surface p-6 shadow-card">
      <h3 className="mb-4 font-display text-lg text-ink">Activité récente</h3>
      <ul className="space-y-4">
        {activities.map((a) => (
          <li key={a.text} className="flex items-start gap-3 text-sm">
            <Clock size={15} className="mt-0.5 shrink-0 text-rose-400" />
            <div>
              <p className="text-ink">{a.text}</p>
              <p className="text-xs text-ink-soft">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

