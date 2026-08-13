"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Link2, Video, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { listMyMeetings, Meeting } from "@/lib/api/meetings";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MeetingsListPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyMeetings()
      .then(setMeetings)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title="Mes réunions" />

      {loading && <p className="text-sm text-ink-soft">Chargement...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!loading && !error && meetings.length === 0 && (
        <p className="text-sm text-ink-soft">
          Aucune réunion planifiée pour le moment. Vos experts peuvent vous inviter à une réunion,
          elle apparaîtra ici et dans vos notifications.
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {meetings.map((m) => (
          <Link
            key={m.id}
            href={`/dashboard/meeting/${m.id}`}
            className="card-surface block p-6 shadow-card transition-transform hover:-translate-y-1"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rise-gradient text-white">
              <Video size={18} />
            </div>
            <h3 className="mb-2 font-display text-lg text-ink">{m.title}</h3>
            <p className="mb-1 flex items-center gap-2 text-sm text-ink-soft">
              <Calendar size={14} />
              {formatDateTime(m.scheduledAt)}
            </p>
            <p className="mb-1 flex items-center gap-2 text-sm text-ink-soft">
              <Link2 size={14} />
              {m.platform}
            </p>
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Users size={14} />
              Avec {m.expert.name}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}