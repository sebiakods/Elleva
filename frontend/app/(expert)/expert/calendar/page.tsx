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

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

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

import { API_BASE_URL as API_URL } from "@/services/api";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const pad = (number: number) => String(number).padStart(2, "0");

function toInputValue(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}


function parseInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return {
    year,
    month: month - 1,
    day,
  };
}

/**
 * Normalize a backend date to:
 *
 * YYYY-MM-DD
 *
 * This avoids timezone issues caused by:
 *
 * new Date("YYYY-MM-DD")
 */
function normalizeDate(date: string) {
  return date.slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Authenticated API                                                          */
/* -------------------------------------------------------------------------- */


async function apiFetch(
  path: string = "",
  options: RequestInit = {}
) {
  const response = await fetch(
    `${API_URL}/expert/calendar${path}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },

      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Erreur ${response.status}`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ExpertCalendarPage() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());

  const [month, setMonth] = useState(today.getMonth());

  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate()
  );

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");

  const [newDescription, setNewDescription] = useState("");

  const [noteDate, setNoteDate] = useState(
    toInputValue(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  );

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Load events                                                             */
  /* ---------------------------------------------------------------------- */

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data: CalendarResponse = await apiFetch(
        `?month=${month + 1}&year=${year}`
      );

      setEvents(
        Array.isArray(data.events)
          ? data.events
          : []
      );
    } catch (err) {
      console.error("LOAD CALENDAR ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le calendrier."
      );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  /* ---------------------------------------------------------------------- */
  /* Load whenever month/year changes                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /* ---------------------------------------------------------------------- */
  /* Calendar calculations                                                   */
  /* ---------------------------------------------------------------------- */

  const firstDow = new Date(year, month, 1).getDay();

  const offset = firstDow === 0 ? 6 : firstDow - 1;

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const cells = Array.from({
    length: offset + daysInMonth,
  });

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                              */
  /* ---------------------------------------------------------------------- */

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
    } else {
      setMonth((current) => current - 1);
    }

    setSelectedDay(null);
    setShowForm(false);
    setError(null);
  };

  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
    } else {
      setMonth((current) => current + 1);
    }

    setSelectedDay(null);
    setShowForm(false);
    setError(null);
  };

  /* ---------------------------------------------------------------------- */
  /* Date helpers                                                            */
  /* ---------------------------------------------------------------------- */

  const getDateString = (
    selectedYear: number,
    selectedMonth: number,
    day: number
  ) => {
    return `${selectedYear}-${pad(
      selectedMonth + 1
    )}-${pad(day)}`;
  };

  const eventsByDay = (day: number) => {
    const dateString = getDateString(
      year,
      month,
      day
    );

    return events.filter(
      (event) =>
        normalizeDate(event.date) === dateString
    );
  };

  const dayEvents = selectedDay
    ? eventsByDay(selectedDay)
    : [];

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  /* ---------------------------------------------------------------------- */
  /* Open form                                                               */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Create note                                                             */
  /* ---------------------------------------------------------------------- */

  const handleAddNote = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const title = newTitle.trim();

    if (!title) {
      setError("Veuillez saisir un titre.");
      return;
    }

    if (!noteDate) {
      setError("Veuillez sélectionner une date.");
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

      await apiFetch("", {
        method: "POST",

        body: JSON.stringify({
          title,
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
       * Move calendar to the date that was saved.
       */
      setYear(newYear);
      setMonth(newMonth);
      setSelectedDay(newDay);

      /*
       * If the saved note belongs to the current month,
       * reload immediately.
       *
       * Otherwise the month change will trigger useEffect.
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

  /* ---------------------------------------------------------------------- */
  /* Delete note                                                             */
  /* ---------------------------------------------------------------------- */

  const handleDelete = async (id: string) => {
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

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-sand-50 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl pt-8">

        {/* ---------------------------------------------------------------- */}
        {/* Breadcrumb                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Experte</span>

          <span className="mx-2 text-ink-soft/40">
            /
          </span>

          <span className="font-medium text-wine-700">
            Calendrier
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="relative mb-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Espace Experte,
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Mon{" "}
            <span className="text-gradient-rise">
              calendrier
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Organisez vos notes personnelles et
            gardez une vue claire sur vos activités
            et vos rendez-vous.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                             */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-4 rounded-full p-1.5 transition-colors hover:bg-rose-100"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Calendar + selected day                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* ================================================================ */}
          {/* Calendar                                                         */}
          {/* ================================================================ */}

          <section className="card-surface p-5 shadow-card sm:p-6">

            {/* Calendar header */}

            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-ink">
                  {MONTHS[month]} {year}
                </h2>

                <p className="mt-1 text-xs text-ink-soft">
                  Sélectionnez une date pour ajouter
                  une note.
                </p>
              </div>

              <div className="flex items-center gap-1">

                <button
                  type="button"
                  onClick={prev}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink focus-ring"
                  aria-label="Mois précédent"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={next}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink focus-ring"
                  aria-label="Mois suivant"
                >
                  <ChevronRight size={18} />
                </button>

              </div>
            </div>

            {/* Week days */}

            <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
              {DAYS.map((day) => (
                <p
                  key={day}
                  className="py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft"
                >
                  {day}
                </p>
              ))}
            </div>

            {/* Calendar days */}

            <div className="grid grid-cols-7 gap-1.5">
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
                      className="h-11 sm:h-12"
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
                      "relative flex h-11 w-full items-center justify-center rounded-xl text-sm transition-all focus-ring sm:h-12",

                      isSelected &&
                        "bg-rise-gradient font-semibold text-white shadow-bloom",

                      !isSelected &&
                        todayCell &&
                        "border-2 border-rose-400 bg-rose-50/40 font-semibold text-rose-600",

                      !isSelected &&
                        !todayCell &&
                        "text-ink hover:bg-sand-50"
                    )}
                  >
                    {day}

                    {hasEvent &&
                      !isSelected && (
                        <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}

            <div className="mt-6 flex items-center gap-2 border-t border-black/[0.05] pt-4 text-xs text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />

              Date avec une note
            </div>
          </section>

          {/* ================================================================ */}
          {/* Selected day                                                     */}
          {/* ================================================================ */}

          <section className="card-surface p-5 shadow-card sm:p-6">

            {/* Selected day header */}

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-ink">
                  {selectedDay
                    ? `${selectedDay} ${MONTHS[month]} ${year}`
                    : "Sélectionnez un jour"}
                </h3>

                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  Notes personnelles de votre
                  calendrier.
                </p>
              </div>

              {!showForm && selectedDay && (
                <button
                  type="button"
                  onClick={() => openForm()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100 focus-ring"
                  aria-label="Ajouter une note"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Add note form                                                  */}
            {/* -------------------------------------------------------------- */}

            {showForm && (
              <form
                onSubmit={handleAddNote}
                className="mb-5 space-y-4 rounded-2xl border border-black/[0.05] bg-sand-50 p-4"
              >

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    Nouvelle note
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-white hover:text-ink"
                    aria-label="Fermer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Date */}

                <div>
                  <label
                    htmlFor="note-date"
                    className="mb-1.5 block text-xs font-medium text-ink-soft"
                  >
                    Date
                  </label>

                  <input
                    id="note-date"
                    type="date"
                    value={noteDate}
                    onChange={(event) =>
                      setNoteDate(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                  />
                </div>

                {/* Title */}

                <div>
                  <label
                    htmlFor="note-title"
                    className="mb-1.5 block text-xs font-medium text-ink-soft"
                  >
                    Titre
                  </label>

                  <input
                    id="note-title"
                    type="text"
                    placeholder="Ex : Suivi Amina K."
                    value={newTitle}
                    onChange={(event) =>
                      setNewTitle(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                  />
                </div>

                {/* Description */}

                <div>
                  <label
                    htmlFor="note-description"
                    className="mb-1.5 block text-xs font-medium text-ink-soft"
                  >
                    Note{" "}
                    <span className="font-normal">
                      (optionnel)
                    </span>
                  </label>

                  <textarea
                    id="note-description"
                    placeholder="Détails optionnels..."
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                  />
                </div>

                {/* Save */}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center rounded-xl bg-rise-gradient px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <>
                      <Plus
                        size={15}
                        className="mr-2"
                      />
                      Enregistrer la note
                    </>
                  )}
                </button>
              </form>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Loading                                                         */}
            {/* -------------------------------------------------------------- */}

            {loading ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
                  <Loader2
                    size={22}
                    className="animate-spin text-rose-500"
                  />
                </div>

                <p className="mt-3 text-sm text-ink-soft">
                  Chargement...
                </p>
              </div>
            ) : dayEvents.length === 0 &&
              !showForm ? (

              /* ------------------------------------------------------------ */
              /* Empty state                                                   */
              /* ------------------------------------------------------------ */

              <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/[0.07] bg-sand-50/50 px-5 py-10 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100">
                  <CalendarDays
                    size={24}
                    className="text-ink-soft"
                  />
                </div>

                <p className="mt-3 text-sm font-medium text-ink">
                  Aucune note ce jour
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-ink-soft">
                  Ajoutez une note pour garder
                  une trace de vos tâches ou
                  suivis importants.
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

              /* ------------------------------------------------------------ */
              /* Notes                                                         */
              /* ------------------------------------------------------------ */

              <div className="space-y-3">

                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative rounded-2xl border border-rose-100 bg-rose-50/60 p-4 transition-all hover:shadow-sm"
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
                      className="absolute right-2 top-2 rounded-lg p-1.5 text-ink-soft opacity-0 transition-all hover:bg-white hover:text-rose-600 group-hover:opacity-100 disabled:opacity-50"
                      aria-label={`Supprimer ${event.title}`}
                    >
                      {deletingId ===
                      event.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>

                    <div className="pr-8">

                      <p className="text-sm font-semibold text-ink">
                        {event.title}
                      </p>

                      {event.description && (
                        <p className="mt-1.5 text-xs leading-5 text-ink-soft">
                          {event.description}
                        </p>
                      )}

                      <Badge
                        tone="rose"
                        className="mt-3"
                      >
                        Note
                      </Badge>

                    </div>
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
          </section>
        </div>
      </div>
    </main>
  );
}
