"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  X,
  Trash2,
  Loader2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const DAYS = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
];

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  allDay: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CalendarResponse = {
  success: boolean;
  events: CalendarEvent[];
  message?: string;
};

type CreateCalendarResponse = {
  success: boolean;
  event?: CalendarEvent;
  message?: string;
};

/**
 * Get the JWT used by the existing authentication system.
 *
 * Supports both common keys used in this project:
 * - accessToken
 * - token
 */
function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

/**
 * Authenticated API helper.
 *
 * API_URL already contains /api:
 *
 * http://localhost:4000/api
 *
 * Therefore:
 *
 * /expert/calendar
 *
 * becomes:
 *
 * http://localhost:4000/api/expert/calendar
 */
async function apiFetch(
  path: string = "",
  options: RequestInit = {}
) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Session expirée. Veuillez vous reconnecter."
    );
  }

  const response = await fetch(
    `${API_URL}/expert/calendar${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
      cache: "no-store",
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Erreur ${response.status}`
    );
  }

  return data;
}

const pad = (number: number) =>
  String(number).padStart(2, "0");

/**
 * Convert calendar values into:
 *
 * YYYY-MM-DD
 */
function toInputValue(
  year: number,
  month: number,
  day: number
) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * Parse:
 *
 * YYYY-MM-DD
 *
 * without using UTC conversion.
 */
function parseInputValue(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return {
    year,
    month: month - 1,
    day,
  };
}

/**
 * Format date returned by backend.
 *
 * Backend returns YYYY-MM-DD.
 *
 * We deliberately avoid:
 *
 * new Date("YYYY-MM-DD").getDate()
 *
 * because that can create timezone problems.
 */
function normalizeDate(date: string) {
  return date.slice(0, 10);
}

export default function ExpertCalendarPage() {
  const today = new Date();

  const [year, setYear] = useState(
    today.getFullYear()
  );

  const [month, setMonth] = useState(
    today.getMonth()
  );

  const [selectedDay, setSelectedDay] =
    useState<number | null>(
      today.getDate()
    );

  const [events, setEvents] = useState<
    CalendarEvent[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [newTitle, setNewTitle] =
    useState("");

  const [newDescription, setNewDescription] =
    useState("");

  const [noteDate, setNoteDate] =
    useState(
      toInputValue(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    );

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /**
   * Load all calendar notes.
   */
  const loadEvents = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * month is sent as 1-12.
         *
         * August = 8
         */
        const data: CalendarResponse =
          await apiFetch(
            `?month=${month + 1}&year=${year}`
          );

        setEvents(
          Array.isArray(data.events)
            ? data.events
            : []
        );
      } catch (err) {
        console.error(
          "LOAD CALENDAR ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le calendrier."
        );
      } finally {
        setLoading(false);
      }
    },
    [month, year]
  );

  /**
   * Load events whenever month/year changes.
   */
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /**
   * Calendar calculation.
   *
   * Monday = first day.
   */
  const firstDow = new Date(
    year,
    month,
    1
  ).getDay();

  const offset =
    firstDow === 0
      ? 6
      : firstDow - 1;

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const cells = Array.from({
    length: offset + daysInMonth,
  });

  /**
   * Previous month.
   */
  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
    } else {
      setMonth((current) => current - 1);
    }

    setSelectedDay(null);
    setShowForm(false);
  };

  /**
   * Next month.
   */
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
    } else {
      setMonth((current) => current + 1);
    }

    setSelectedDay(null);
    setShowForm(false);
  };

  /**
   * Build YYYY-MM-DD for a calendar day.
   */
  const getDateString = (
    selectedYear: number,
    selectedMonth: number,
    day: number
  ) => {
    return `${selectedYear}-${pad(
      selectedMonth + 1
    )}-${pad(day)}`;
  };

  /**
   * Events belonging to a specific day.
   */
  const eventsByDay = (day: number) => {
    const dateString = getDateString(
      year,
      month,
      day
    );

    return events.filter(
      (event) =>
        normalizeDate(event.date) ===
        dateString
    );
  };

  /**
   * Events for selected day.
   */
  const dayEvents = selectedDay
    ? eventsByDay(selectedDay)
    : [];

  /**
   * Is this today's date?
   */
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  /**
   * Open note form.
   */
  const openForm = (day?: number) => {
    const selected =
      day ??
      selectedDay ??
      today.getDate();

    setNoteDate(
      toInputValue(
        year,
        month,
        selected
      )
    );

    setNewTitle("");
    setNewDescription("");
    setError(null);
    setShowForm(true);
  };

  /**
   * Add calendar note.
   */
  const handleAddNote = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!newTitle.trim()) {
      setError(
        "Veuillez saisir un titre."
      );
      return;
    }

    if (!noteDate) {
      setError(
        "Veuillez sélectionner une date."
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const {
        year: newYear,
        month: newMonth,
        day: newDay,
      } = parseInputValue(noteDate);

      /*
       * Send YYYY-MM-DD directly.
       *
       * The backend converts it to the correct
       * database DateTime.
       */
      await apiFetch("", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          description:
            newDescription.trim() || null,
          date: noteDate,
          allDay: true,
        }),
      });

      setNewTitle("");
      setNewDescription("");
      setShowForm(false);

      /*
       * Move calendar to the saved date.
       */
      setYear(newYear);
      setMonth(newMonth);
      setSelectedDay(newDay);

      /*
       * If we are staying in the same month,
       * reload immediately.
       *
       * If month changed, useEffect will reload.
       */
      if (
        newYear === year &&
        newMonth === month
      ) {
        await loadEvents();
      }
    } catch (err) {
      console.error(
        "CREATE CALENDAR NOTE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer la note."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete calendar note.
   */
  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Voulez-vous supprimer cette note ?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await apiFetch(`/${id}`, {
        method: "DELETE",
      });

      setEvents((current) =>
        current.filter(
          (event) => event.id !== id
        )
      );
    } catch (err) {
      console.error(
        "DELETE CALENDAR NOTE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer la note."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Header title="Calendrier" />

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
            className="ml-4 rounded-full p-1 hover:bg-rose-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* =========================
            CALENDAR
        ========================== */}

        <div className="card-surface p-6 shadow-card">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="font-display text-xl text-ink">
                {MONTHS[month]} {year}
              </h2>

              <p className="mt-1 text-xs text-ink-soft">
                Sélectionnez une date pour
                ajouter une note.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={prev}
                className="rounded-full p-2 transition-colors hover:bg-sand-100 focus-ring"
                aria-label="Mois précédent"
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              <button
                type="button"
                onClick={next}
                className="rounded-full p-2 transition-colors hover:bg-sand-100 focus-ring"
                aria-label="Mois suivant"
              >
                <ChevronRight
                  size={18}
                />
              </button>

            </div>
          </div>

          {/* Week days */}

          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {DAYS.map((day) => (
              <p
                key={day}
                className="py-1 text-xs font-semibold text-ink-soft"
              >
                {day}
              </p>
            ))}
          </div>

          {/* Calendar */}

          <div className="grid grid-cols-7 gap-1">

            {cells.map((_, index) => {

              const day =
                index - offset + 1;

              const valid =
                day > 0 &&
                day <= daysInMonth;

              if (!valid) {
                return (
                  <div
                    key={index}
                    className="h-10"
                  />
                );
              }

              const hasEvent =
                eventsByDay(day).length > 0;

              const isSelected =
                selectedDay === day;

              const todayCell =
                isToday(day);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    setShowForm(false);
                    setError(null);
                  }}
                  className={cn(
                    "relative flex h-10 w-full items-center justify-center rounded-xl text-sm transition-all focus-ring",

                    isSelected &&
                      "bg-rise-gradient font-semibold text-white shadow-bloom",

                    !isSelected &&
                      todayCell &&
                      "border-2 border-rose-400 font-semibold text-rose-600",

                    !isSelected &&
                      !todayCell &&
                      "text-ink hover:bg-sand-50"
                  )}
                >
                  {day}

                  {hasEvent &&
                    !isSelected && (
                      <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rose-500" />
                    )}
                </button>
              );
            })}
          </div>

          {/* Legend */}

          <div className="mt-5 flex items-center gap-2 text-xs text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Date avec une note
          </div>

        </div>

        {/* =========================
            DAY DETAILS
        ========================== */}

        <div className="card-surface p-6 shadow-card">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="font-display text-lg text-ink">
                {selectedDay
                  ? `${selectedDay} ${MONTHS[month]} ${year}`
                  : "Sélectionnez un jour"}
              </h3>

              <p className="mt-1 text-xs text-ink-soft">
                Notes personnelles de votre calendrier.
              </p>
            </div>

            {!showForm && selectedDay && (
              <button
                type="button"
                onClick={() =>
                  openForm()
                }
                className="rounded-full p-1.5 transition-colors hover:bg-sand-100 focus-ring"
                aria-label="Ajouter une note"
              >
                <Plus
                  size={18}
                  className="text-rose-500"
                />
              </button>
            )}

          </div>

          {/* Add form */}

          {showForm && (
            <form
              onSubmit={handleAddNote}
              className="mb-4 space-y-3 rounded-xl bg-sand-50 p-4"
            >

              <div className="flex items-center justify-between">

                <p className="text-xs font-semibold text-ink-soft">
                  Nouvelle note
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-full p-1 text-ink-soft hover:bg-white hover:text-ink"
                  aria-label="Fermer"
                >
                  <X size={16} />
                </button>

              </div>

              {/* Date */}

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Date
                </label>

                <input
                  type="date"
                  value={noteDate}
                  onChange={(event) =>
                    setNoteDate(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm focus-ring"
                />
              </div>

              {/* Title */}

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Titre
                </label>

                <input
                  type="text"
                  placeholder="Ex : Suivi Amina K."
                  value={newTitle}
                  onChange={(event) =>
                    setNewTitle(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm focus-ring"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Note
                  <span className="ml-1 font-normal">
                    (optionnel)
                  </span>
                </label>

                <textarea
                  placeholder="Détails optionnels..."
                  value={newDescription}
                  onChange={(event) =>
                    setNewDescription(
                      event.target.value
                    )
                  }
                  rows={2}
                  className="w-full resize-none rounded-lg border border-sand-200 px-3 py-2 text-sm focus-ring"
                />
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center rounded-xl bg-rise-gradient px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={15}
                      className="mr-2 animate-spin"
                    />

                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer la note"
                )}
              </button>

            </form>
          )}

          {/* Loading */}

          {loading ? (
            <div className="flex flex-col items-center py-8 text-center">

              <Loader2
                size={25}
                className="mb-3 animate-spin text-rose-500"
              />

              <p className="text-sm text-ink-soft">
                Chargement...
              </p>

            </div>
          ) : dayEvents.length === 0 &&
            !showForm ? (

            /* Empty */

            <div className="flex flex-col items-center py-8 text-center">

              <CalendarDays
                size={28}
                className="mb-3 text-sand-200"
              />

              <p className="text-sm text-ink-soft">
                Aucune note ce jour
              </p>

              {selectedDay && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4"
                  onClick={() =>
                    openForm()
                  }
                >
                  <Plus
                    size={15}
                    className="mr-1"
                  />

                  Ajouter une note
                </Button>
              )}

            </div>

          ) : (

            /* Notes */

            <div className="space-y-3">

              {dayEvents.map((event) => (

                <div
                  key={event.id}
                  className="group relative rounded-xl border-l-4 border-rose-400 bg-rose-50 p-4"
                >

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        event.id
                      )
                    }
                    disabled={
                      deletingId ===
                      event.id
                    }
                    className="absolute right-2 top-2 rounded-full p-1.5 text-ink-soft opacity-0 transition-all hover:bg-white hover:text-rose-600 group-hover:opacity-100 disabled:opacity-50"
                    aria-label="Supprimer"
                  >
                    {deletingId ===
                    event.id ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2
                        size={14}
                      />
                    )}
                  </button>

                  <p className="pr-8 text-sm font-semibold text-ink">
                    {event.title}
                  </p>

                  {event.description && (
                    <p className="mt-1 text-xs text-ink-soft">
                      {event.description}
                    </p>
                  )}

                  <Badge
                    tone="rose"
                    className="mt-2"
                  >
                    Note
                  </Badge>

                </div>

              ))}

              {!showForm && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() =>
                    openForm()
                  }
                >
                  <Plus
                    size={15}
                    className="mr-1"
                  />

                  Ajouter une note
                </Button>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
}
