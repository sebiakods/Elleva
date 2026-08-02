import { Header } from "@/components/layout/Header";

const threads = [
  { name: "Dr. Leila Hamdi (Mentore)", preview: "J'ai révisé votre business plan, quelques suggestions…", time: "10:24", unread: true },
  { name: "Support Ellevadz", preview: "Votre candidature a bien été reçue.", time: "Hier", unread: false },
  { name: "Banque Al Baraka", preview: "Documents complémentaires requis pour votre dossier.", time: "Lun.", unread: false },
];

export default function MessagesPage() {
  return (
    <>
      <Header title="Messages" />
      <div className="card-surface divide-y divide-sand-100 shadow-card">
        {threads.map((t) => (
          <div key={t.name} className="flex items-center gap-4 p-5 transition-colors hover:bg-rose-50/40">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rise-gradient text-sm font-semibold text-white">
              {t.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${t.unread ? "font-semibold text-ink" : "text-ink"}`}>{t.name}</p>
                <span className="text-xs text-ink-soft">{t.time}</span>
              </div>
              <p className="truncate text-sm text-ink-soft">{t.preview}</p>
            </div>
            {t.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />}
          </div>
        ))}
      </div>
    </>
  );
}
