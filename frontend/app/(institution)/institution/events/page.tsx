"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  MapPin,
  Users,
  Video,
  Plus,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type EventType =
  | "webinaire"
  | "atelier"
  | "seance_information";

type EventStatus =
  | "upcoming"
  | "past"
  | "cancelled";

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

type EventsResponse = {
  success?: boolean;
  data?: EventItem[];
  message?: string;
};

const API_BASE_URL = "/api";

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

const STATUS_TONES: Record<
  EventStatus,
  "gold" | "wine" | "rose"
> = {
  upcoming: "wine",
  past: "gold",
  cancelled: "rose",
};

export default function InstitutionEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<"all" | EventType>("all");

  const [statusFilter, setStatusFilter] =
    useState<"all" | EventStatus>("all");

  /**
   * ============================================================
   * LOAD EVENTS
   * ============================================================
   *
   * Authentication:
   * - NO localStorage
   * - NO accessToken
   * - NO Authorization header
   *
   * The browser automatically sends the httpOnly auth cookie
   * because credentials: "include" is enabled.
   */
  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/institution/events`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      let json: EventsResponse | null = null;

      try {
        json = (await res.json()) as EventsResponse;
      } catch {
        json = null;
      }

      if (!res.ok) {
        throw new Error(
          json?.message ??
            `Erreur ${res.status}: Impossible de charger les événements.`
        );
      }

      if (!json?.success && !Array.isArray(json?.data)) {
        throw new Error(
          json?.message ??
            "Les données des événements sont invalides."
        );
      }

      setEvents(
        Array.isArray(json?.data)
          ? json.data
          : []
      );
    } catch (err) {
      console.error(
        "Erreur de chargement des événements:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les événements."
      );

      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      if (cancelled) {
        return;
      }

      await loadEvents();
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * ============================================================
   * FILTER EVENTS
   * ============================================================
   */
  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return [...events]
      .filter((event) => {
        const matchesQuery =
          normalizedQuery === "" ||
          event.title
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesType =
          typeFilter === "all" ||
          event.type === typeFilter;

        const matchesStatus =
          statusFilter === "all" ||
          event.status === statusFilter;

        return (
          matchesQuery &&
          matchesType &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        return (
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
        );
      });
  }, [
    events,
    query,
    typeFilter,
    statusFilter,
  ]);

  /**
   * ============================================================
   * STATISTICS
   * ============================================================
   */
  const stats = useMemo(() => {
    const total = events.length;

    const upcoming = events.filter(
      (event) => event.status === "upcoming"
    ).length;

    const totalRegistered = events.reduce(
      (sum, event) =>
        sum + (Number(event.registered) || 0),
      0
    );

    return {
      total,
      upcoming,
      totalRegistered,
    };
  }, [events]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ======================================================
          BREADCRUMB
      ====================================================== */}
      <div className="text-sm text-ink-soft">
        <span>Espace Institution</span>

        <span className="mx-2 text-ink-soft/40">
          /
        </span>

        <span className="font-medium text-wine-700">
          Événements
        </span>
      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <div>
          <p className="font-script text-2xl leading-none text-rose-500">
            Agenda institutionnel
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Gestion des{" "}
            <span className="text-gradient-rise">
              Événements
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Publiez des webinaires, ateliers et séances
            d&apos;information. Gérez les inscriptions et
            communiquez facilement avec les participantes.
          </p>
        </div>

        <Link
          href="/institution/events/new"
          className="shrink-0"
        >
          <Button>
            <Plus size={18} />
            Créer un événement
          </Button>
        </Link>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}
      {error && (
        <Card hover={false}>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="shrink-0"
              />

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={loadEvents}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Réessayer
            </button>
          </div>
        </Card>
      )}

      {/* ======================================================
          STATS
      ====================================================== */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <CalendarDays size={20} />
            </div>

            <div>
              <p className="text-sm text-ink-soft">
                Total événements
              </p>

              <p className="font-display text-2xl text-ink">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Clock size={20} />
            </div>

            <div>
              <p className="text-sm text-ink-soft">
                À venir
              </p>

              <p className="font-display text-2xl text-ink">
                {stats.upcoming}
              </p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Users size={20} />
            </div>

            <div>
              <p className="text-sm text-ink-soft">
                Inscriptions totales
              </p>

              <p className="font-display text-2xl text-ink">
                {stats.totalRegistered}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}
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
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className="pl-11"
            />
          </div>

          <Select
            label=""
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value as
                  | "all"
                  | EventType
              )
            }
          >
            <option value="all">
              Tous les types
            </option>

            <option value="webinaire">
              Webinaire
            </option>

            <option value="atelier">
              Atelier
            </option>

            <option value="seance_information">
              Séance d&apos;information
            </option>
          </Select>

          <Select
            label=""
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "all"
                  | EventStatus
              )
            }
          >
            <option value="all">
              Tous les statuts
            </option>

            <option value="upcoming">
              À venir
            </option>

            <option value="past">
              Terminé
            </option>

            <option value="cancelled">
              Annulé
            </option>
          </Select>
        </div>
      </Card>

      {/* ======================================================
          EVENTS
      ====================================================== */}
      {loading ? (
        <Card hover={false}>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-soft">
            <Loader2
              size={24}
              className="animate-spin text-rose-600"
            />

            <p className="text-sm">
              Chargement des événements...
            </p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card hover={false}>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
              <CalendarDays size={22} />
            </div>

            <p className="font-display text-xl text-ink">
              Aucun événement trouvé
            </p>

            <p className="max-w-md text-sm text-ink-soft">
              Essayez de modifier vos filtres ou
              créez un nouvel événement.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((event) => {
            const eventDate = new Date(
              event.date
            );

            const day =
              eventDate.toLocaleDateString(
                "fr-FR",
                {
                  day: "2-digit",
                }
              );

            const month =
              eventDate.toLocaleDateString(
                "fr-FR",
                {
                  month: "short",
                }
              );

            const capacity =
              Number(event.capacity) || 0;

            const registered =
              Number(event.registered) || 0;

            const fillRate =
              capacity > 0
                ? Math.round(
                    (registered /
                      capacity) *
                      100
                  )
                : 0;

            return (
              <Card key={event.id}>
                {/* EVENT HEADER */}
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
                      <Badge
                        tone={
                          STATUS_TONES[
                            event.status
                          ] ?? "wine"
                        }
                      >
                        {STATUS_LABELS[
                          event.status
                        ] ?? event.status}
                      </Badge>

                      <Badge tone="gold">
                        {TYPE_LABELS[
                          event.type
                        ] ?? event.type}
                      </Badge>
                    </div>

                    <h3 className="mt-2 font-display text-lg text-ink">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* EVENT DETAILS */}
                <div className="mt-4 space-y-2 text-sm text-ink-soft">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />

                    <span>
                      {event.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {event.online ? (
                      <Video size={14} />
                    ) : (
                      <MapPin size={14} />
                    )}

                    <span className="truncate">
                      {event.location}
                    </span>
                  </div>
                </div>

                {/* REGISTRATION */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-ink-soft">
                    <span>
                      {registered} /{" "}
                      {capacity} inscrites
                    </span>

                    <span className="font-semibold text-ink">
                      {fillRate}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-sand-100">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            fillRate,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
