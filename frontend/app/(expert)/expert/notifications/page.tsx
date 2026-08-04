"use client";
import { useState } from "react";
import { Bell, CalendarCheck, FileText, MessageSquare, Star, CheckCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const NOTIFS = [
  { id:"1", icon:CalendarCheck, title:"Nouvelle session réservée", body:"Amina Kaddour a réservé une session pour le 5 juillet à 15h00.", time:"Il y a 30 min", unread:true, tone:"wine" as const },
  { id:"2", icon:FileText, title:"Business plan soumis", body:"Yasmine Bensaid vient de soumettre son business plan « Souk Bio » pour révision.", time:"Il y a 2h", unread:true, tone:"rose" as const },
  { id:"3", icon:Star, title:"Nouvel avis reçu", body:"Lina Tabet vous a attribué 5 étoiles suite à sa session.", time:"Hier", unread:true, tone:"gold" as const },
  { id:"4", icon:MessageSquare, title:"Nouveau message", body:"Sara Khelil vous a envoyé un message concernant son étude de marché.", time:"Hier", unread:false, tone:"rose" as const },
  { id:"5", icon:Bell, title:"Rappel : session dans 1h", body:"Vous avez une session avec Amina Kaddour à 15:00 aujourd'hui.", time:"Il y a 3j", unread:false, tone:"wine" as const },
];

export default function ExpertNotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, unread:false })));
  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <>
      <Header title="Notifications" />
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-ink-soft">{unreadCount} non lue{unreadCount !== 1 ? "s" : ""}</p>
          {unreadCount > 0 && <Badge tone="rose">{unreadCount}</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAll}>
            <CheckCheck size={15}/> Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="card-surface divide-y divide-sand-100 shadow-card">
        {notifs.map(n => (
          <div key={n.id}
            className={cn("flex items-start gap-4 p-5 transition-colors", n.unread && "bg-rose-50/50")}>
            <span className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              n.tone === "rose" && "bg-rose-50 text-rose-600",
              n.tone === "wine" && "bg-wine-50 text-wine-500",
              n.tone === "gold" && "bg-amber-50 text-gold-500",
            )}>
              <n.icon size={18}/>
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className={cn("text-sm", n.unread ? "font-semibold text-ink" : "font-medium text-ink")}>{n.title}</p>
                <span className="shrink-0 text-xs text-ink-soft">{n.time}</span>
              </div>
              <p className="mt-0.5 text-sm text-ink-soft leading-relaxed">{n.body}</p>
            </div>
            {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500"/>}
          </div>
        ))}
      </div>
    </>
  );
}