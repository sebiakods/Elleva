"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Link2, Video, Users, Heart, Sparkle } from "lucide-react";
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
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Entrepreneuse</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Réunions</span>
        </div>

        {/* Header */}
        <div className="relative mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <div>
            <p className="font-script text-2xl leading-none text-rose-500">
              Vue d&apos;ensemble
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
              Mes <span className="text-gradient-rise">réunions</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Retrouvez tous vos échanges programmés avec vos experts, en un
              seul endroit.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-[2rem] border border-rose-100/60 bg-white/70"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && meetings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-rose-200 bg-white/60 px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
              <Sparkle size={22} />
            </div>
            <p className="font-script text-xl text-rose-500">
              Rien à l&apos;agenda pour l&apos;instant
            </p>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              Aucune réunion planifiée pour le moment. Vos experts peuvent vous
              inviter à une réunion, elle apparaîtra ici et dans vos
              notifications.
            </p>
          </div>
        )}

        {/* Meetings grid */}
        {!loading && !error && meetings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {meetings.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/meeting/${m.id}`}
                className="
                  group
                  relative
                  block
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-rose-100/70
                  bg-white
                  p-6
                  shadow-card
                  transition-all
                  duration-300
                  hover:-translate-y-1.5
                  hover:border-rose-200
                  hover:shadow-bloom
                "
              >
                {/* decorative corner bloom */}
                <div
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-32
                    w-32
                    rounded-full
                    bg-rise-gradient-soft
                    opacity-0
                    blur-2xl
                    transition-opacity
                    duration-500
                    group-hover:opacity-70
                  "
                />

                {/* floating heart accent */}
                <Heart
                  size={14}
                  className="
                    absolute
                    right-5
                    top-5
                    text-rose-200
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:translate-y-0.5
                    group-hover:opacity-100
                  "
                  fill="currentColor"
                />

                <div className="relative">
                  {/* icon badge */}
                  <div
                    className="
                      mb-4
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-rise-gradient
                      text-white
                      shadow-sm
                      transition-transform
                      duration-300
                      group-hover:scale-105
                      group-hover:rotate-3
                    "
                  >
                    <Video size={19} />
                  </div>

                  <p className="font-script text-lg leading-none text-rose-400">
                    Rendez-vous
                  </p>

                  <h3 className="mt-1.5 mb-4 line-clamp-2 font-display text-lg font-semibold text-wine-900">
                    {m.title}
                  </h3>

                  <div className="space-y-2.5">
                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                        <Calendar size={13} />
                      </span>
                      {formatDateTime(m.scheduledAt)}
                    </p>

                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                        <Link2 size={13} />
                      </span>
                      {m.platform}
                    </p>

                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                        <Users size={13} />
                      </span>
                      Avec {m.expert.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
