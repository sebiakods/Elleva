import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MessageSquare } from "lucide-react";

const tickets = [
  { from: "Amina K.", subject: "Problème de connexion", status: "Ouvert", time: "Il y a 30 min" },
  { from: "Yasmine B.", subject: "Téléchargement PDF non disponible", status: "En cours", time: "Il y a 2h" },
  { from: "Lina T.", subject: "Question sur l'éligibilité ANADE", status: "Résolu", time: "Hier" },
];

const tone = { Ouvert: "wine", "En cours": "gold", Résolu: "rose" } as const;

export default function AdminMessagesPage() {
  return (
    <>
      <Header title="Support & messages" />
      <div className="space-y-4">
        {tickets.map((t) => (
          <div key={t.subject} className="card-surface flex items-center gap-4 p-5 shadow-card">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <MessageSquare size={17} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">{t.from}</p>
                <span className="text-xs text-ink-soft">{t.time}</span>
              </div>
              <p className="truncate text-sm text-ink-soft">{t.subject}</p>
            </div>
            <Badge tone={tone[t.status as keyof typeof tone]}>{t.status}</Badge>
            <Button variant="ghost" size="sm">Répondre</Button>
          </div>
        ))}
      </div>
    </>
  );
}
