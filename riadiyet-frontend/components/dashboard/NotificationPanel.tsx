import { Bell } from "lucide-react";

const notifications = [
  { text: "Votre business plan a été révisé par votre mentore.", unread: true },
  { text: "Nouveau programme « Fonds d'amorçage Startups » disponible.", unread: true },
  { text: "Votre profil est complété à 80%.", unread: false },
];

export function NotificationPanel() {
  return (
    <div className="card-surface p-6 shadow-card">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-ink">
        <Bell size={18} className="text-rose-500" /> Notifications
      </h3>
      <ul className="space-y-3">
        {notifications.map((n, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-xl bg-sand-50 p-3 text-sm text-ink-soft">
            {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
