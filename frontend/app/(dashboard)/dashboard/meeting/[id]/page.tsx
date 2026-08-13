"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Link2, Video, Users, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { getMeeting, Meeting } from "@/lib/api/meetings";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    getMeeting(params.id)
      .then(setMeeting)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Une erreur est survenue");
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <>
        <Header title="Réunion" />
        <p className="text-sm text-ink-soft">Chargement...</p>
      </>
    );
  }

  if (error || !meeting) {
    return (
      <>
        <Header title="Réunion" />
        <p className="text-sm text-rose-600">{error || "Réunion introuvable"}</p>
      </>
    );
  }

  return (
    <>
      <Header title="Détails de la réunion" />

      <div className="mx-auto max-w-2xl">
        <div className="card-surface p-8 shadow-card">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-rise-gradient text-white">
            <Video size={18} />
          </div>
          <h1 className="mt-3 font-display text-2xl text-ink">{meeting.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">Avec {meeting.expert?.name}</p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-sand-50 p-4">
              <Calendar size={18} className="text-rose-500" />
              <span className="text-sm text-ink">{formatDateTime(meeting.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-sand-50 p-4">
              <Link2 size={18} className="text-rose-500" />
              <span className="text-sm text-ink">{meeting.platform}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-sand-50 p-4">
              <Users size={18} className="text-rose-500" />
              <span className="text-sm text-ink">
                {meeting.participants.map((p) => p.user.name).join(", ")}
              </span>
            </div>
          </div>

          {meeting.notes && (
            <div className="mt-6 border-t border-sand-100 pt-6">
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <FileText size={16} />
                Notes
              </h2>
              <p className="text-sm leading-relaxed text-ink-soft">{meeting.notes}</p>
            </div>
          )}

          <a
            href={meeting.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block w-full rounded-full bg-rise-gradient py-3.5 text-center font-semibold text-white shadow-bloom hover:-translate-y-0.5 transition"
          >
            Rejoindre la réunion
          </a>
        </div>
      </div>
    </>
  );
}