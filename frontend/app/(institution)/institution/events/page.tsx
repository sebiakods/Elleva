"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  MapPin,
  Users,
  Video,
  Plus,
  Clock,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type EventType = "webinaire" | "atelier" | "seance_information";
type EventStatus = "upcoming" | "past" | "cancelled";

type EventItem = {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  date: string;
  time: string;
  location: string;
  online: boolean;
  capacity: number;
  registered: number;
  description: string;
};

const MOCK_EVENTS: EventItem[] = [
  {
    id: "1",
    title: "Webinaire : Financer son projet en 2026",
    type: "webinaire",
    status: "upcoming",
    date: "2026-07-22",
    time: "14:00",
    location: "En ligne",
    online: true,
    capacity: 100,
    registered: 68,
    description:
      "Panorama des dispositifs de financement disponibles pour les entrepreneures cette année.",
  },
  {
    id: "2",
    title: "Atelier : Construire son Business Plan",
    type: "atelier",
    status: "upcoming",
    date: "2026-07-28",
    time: "09:30",
    location: "Sétif — Siège de l'institution",
    online: false,
    capacity: 30,
    registered: 24,
    description:
      "Atelier pratique pour structurer un business plan solide avant de candidater.",
  },
  {
    id: "3",
    title: "Séance d'information : Programme Innovation Femmes",
    type: "seance_information",
    status: "upcoming",
    date: "2026-08-05",
    time: "11:00",
    location: "En ligne",
    online: true,
    capacity: 200,
    registered: 45,
    description:
      "Présentation détaillée des critères d'éligibilité et du processus de candidature.",
  },
  {
    id: "4",
    title: "Webinaire : Réussir son pitch devant un jury",
    type: "webinaire",
    status: "past",
    date: "2026-06-10",
    time: "15:00",
    location: "En ligne",
    online: true,
    capacity: 100,
    registered: 91,
    description: "Techniques et conseils pour convaincre un comité de sélection.",
  },
  {
    id: "5",
    title: "Atelier : Gestion financière pour PME",
    type: "atelier",
    status: "cancelled",
    date: "2026-06-18",
    time: "10:00",
    location: "Alger — Antenne régionale",
    online: false,
    capacity: 25,
    registered: 12,
    description: "Atelier annulé pour indisponibilité de l'intervenant.",
  },
];

const TYPE_LABELS: Record<EventType, string> = {
  webinaire: "Webinaire",
  atelier: "Atelier",
  seance_information: "Séance d'information",
};

const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "À venir",
  past: "Terminé",
  cancelled: "Annulé",
};

const STATUS_TONES: Record<EventStatus, "gold" | "wine" | "rose"> = {
  upcoming: "wine",
  past: "gold",
  cancelled: "rose",
};

export default function InstitutionEventsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EventType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all");

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter((e) => {
      const matchesQuery =
        query.trim() === "" ||
        e.title.toLowerCase().includes(query.trim().toLowerCase());
      const matchesType = typeFilter === "all" || e.type === typeFilter;
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [query, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = MOCK_EVENTS.length;
    const upcoming = MOCK_EVENTS.filter((e) => e.status === "upcoming").length;
    const totalRegistered = MOCK_EVENTS.reduce((sum, e) => sum + e.registered, 0);

    return { total, upcoming, totalRegistered };
  }, []);

  return (
    <>
      <Header title="Événements" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Agenda institutionnel</Badge>
            </div>

            <h1 className="font-display text-4xl text-ink">Événements</h1>

            <p className="mt-3 max-w-3xl text-ink-soft">
              Publiez des webinaires, ateliers et séances d'information. Gérez
              les inscriptions et communiquez avec les participantes.
            </p>
          </div>

          <Link href="/institution/events/new">
            <Button>
              <Plus size={18} />
              Créer un événement
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Total événements</p>
                <p className="font-display text-2xl text-ink">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">À venir</p>
                <p className="font-display text-2xl text-ink">{stats.upcoming}</p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Inscriptions totales</p>
                <p className="font-display text-2xl text-ink">
                  {stats.totalRegistered}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card hover={false}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <Input
                placeholder="Rechercher un événement..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Select
              label=""
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | EventType)}
            >
              <option value="all">Tous les types</option>
              <option value="webinaire">Webinaire</option>
              <option value="atelier">Atelier</option>
              <option value="seance_information">Séance d'information</option>
            </Select>

            <Select
              label=""
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | EventStatus)
              }
            >
              <option value="all">Tous les statuts</option>
              <option value="upcoming">À venir</option>
              <option value="past">Terminé</option>
              <option value="cancelled">Annulé</option>
            </Select>
          </div>
        </Card>

        {/* List */}
        {filtered.length === 0 ? (
          <Card hover={false}>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
                <CalendarDays size={22} />
              </div>
              <p className="font-display text-xl text-ink">
                Aucun événement trouvé
              </p>
              <p className="max-w-md text-sm text-ink-soft">
                Essayez de modifier vos filtres ou créez un nouvel événement.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((event) => {
              const eventDate = new Date(event.date);
              const day = eventDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
              });
              const month = eventDate.toLocaleDateString("fr-FR", {
                month: "short",
              });
              const fillRate =
                event.capacity > 0
                  ? Math.round((event.registered / event.capacity) * 100)
                  : 0;

              return (
                <Card key={event.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                      <span className="text-lg font-bold leading-none">
                        {day}
                      </span>
                      <span className="text-xs uppercase leading-none">
                        {month}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={STATUS_TONES[event.status]}>
                          {STATUS_LABELS[event.status]}
                        </Badge>
                        <Badge tone="gold">{TYPE_LABELS[event.type]}</Badge>
                      </div>

                      <h3 className="mt-2 font-display text-lg text-ink">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm text-ink-soft">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-ink-soft">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      {event.online ? (
                        <Video size={14} />
                      ) : (
                        <MapPin size={14} />
                      )}
                      {event.location}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-ink-soft">
                      <span>
                        {event.registered} / {event.capacity} inscrites
                      </span>
                      <span className="font-semibold text-ink">
                        {fillRate}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-sand-100">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all"
                        style={{ width: `${fillRate}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}