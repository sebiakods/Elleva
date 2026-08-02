import { Bell, FileText, Heart, MessageSquare } from "lucide-react";
import { Header } from "@/components/layout/Header";

const notifications = [
  { icon: FileText, text: "Votre business plan « Souk Bio » a été approuvé.", time: "Il y a 1h" },
  { icon: Heart, text: "Nouveau programme correspondant à vos favoris.", time: "Il y a 3h" },
  { icon: MessageSquare, text: "Nouveau message de votre mentore.", time: "Hier" },
  { icon: Bell, text: "Rappel : complétez votre profil pour plus de recommandations.", time: "Il y a 2 jours" },
];

export default function NotificationsPage() {
  return (
    <>
      <Header title="Notifications" />
      <div className="card-surface divide-y divide-sand-100 shadow-card">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <n.icon size={17} />
            </span>
            <div>
              <p className="text-sm text-ink">{n.text}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
