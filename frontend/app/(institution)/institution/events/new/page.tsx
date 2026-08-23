"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Users,
  FileText,
  Send,
  Loader2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const API_URL = '/api';

type EventType =
  | "webinaire"
  | "atelier"
  | "seance_information";

type EventFormat =
  | "en_ligne"
  | "presentiel";

type EventStatus =
  | "draft"
  | "published";

type EventForm = {
  title: string;
  type: EventType;
  description: string;

  format: EventFormat;
  location: string;
  meetingLink: string;

  date: string;
  time: string;
  duration: string;

  capacity: string;
  speaker: string;

  status: EventStatus;
};

const initialForm: EventForm = {
  title: "",
  type: "webinaire",
  description: "",

  format: "en_ligne",
  location: "",
  meetingLink: "",

  date: "",
  time: "",
  duration: "60",

  capacity: "",
  speaker: "",

  status: "draft",
};

type Toast = {
  type: "success" | "error";
  text: string;
};

type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export default function NewEventPage() {
  const router = useRouter();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Toast | null>(null);

  function update<K extends keyof EventForm>(
    key: K,
    value: EventForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setMessage(null);
  }

  function validateForm(status: EventStatus): string | null {
    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      return "Veuillez saisir le titre de l'événement.";
    }

    if (title.length < 3) {
      return "Le titre doit contenir au moins 3 caractères.";
    }

    if (!description) {
      return "Veuillez saisir une description.";
    }

    if (!form.date) {
      return "Veuillez sélectionner une date.";
    }

    if (!form.time) {
      return "Veuillez sélectionner une heure.";
    }

    if (!form.duration) {
      return "Veuillez sélectionner une durée.";
    }

    if (form.format === "en_ligne") {
      if (!form.meetingLink.trim()) {
        return "Veuillez saisir le lien de la visioconférence.";
      }

      try {
        new URL(form.meetingLink.trim());
      } catch {
        return "Le lien de la visioconférence n'est pas valide.";
      }
    }

    if (form.format === "presentiel") {
      if (!form.location.trim()) {
        return "Veuillez saisir l'adresse de l'événement.";
      }
    }

    if (form.capacity.trim() !== "") {
      const capacity = Number(form.capacity);

      if (!Number.isFinite(capacity)) {
        return "La capacité doit être un nombre valide.";
      }

      if (capacity <= 0) {
        return "La capacité doit être supérieure à 0.";
      }

      if (!Number.isInteger(capacity)) {
        return "La capacité doit être un nombre entier.";
      }
    }

    if (status === "published" && !form.speaker.trim()) {
      return "Veuillez renseigner l'intervenant(e) avant de publier.";
    }

    return null;
  }

  async function postEvent(status: EventStatus) {
    const validationError = validateForm(status);

    if (validationError) {
      throw new Error(validationError);
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,

      date: form.date,
      time: form.time,
      duration: Number(form.duration),

      format: form.format,

      location:
        form.format === "presentiel"
          ? form.location.trim()
          : null,

      meetingLink:
        form.format === "en_ligne"
          ? form.meetingLink.trim()
          : null,

      capacity:
        form.capacity.trim() !== ""
          ? Number(form.capacity)
          : null,

      speaker:
        form.speaker.trim() !== ""
          ? form.speaker.trim()
          : null,

      isPublished: status === "published",
    };

    /**
     * IMPORTANT:
     *
     * No localStorage.
     * No accessToken.
     * No Authorization header.
     *
     * Authentication is handled by the httpOnly cookie.
     */
    const response = await fetch(
      `${API_URL}/institution/events`,
      {
        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    let json: ApiResponse = {};

    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        if (!response.ok) {
          throw new Error(
            `Le serveur a retourné une réponse invalide (${response.status}).`
          );
        }

        throw new Error(
          "Le serveur a retourné une réponse invalide."
        );
      }
    }

    if (response.status === 401) {
      throw new Error(
        "Votre session a expiré. Veuillez vous reconnecter."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "Vous n'avez pas l'autorisation de créer un événement."
      );
    }

    if (!response.ok) {
      throw new Error(
        json.message ||
          json.error ||
          `Impossible d'enregistrer l'événement (${response.status}).`
      );
    }

    if (json.success === false) {
      throw new Error(
        json.message ||
          json.error ||
          "Impossible d'enregistrer l'événement."
      );
    }

    return json.data;
  }

  async function saveDraft() {
    if (saving) return;

    setSaving(true);
    setMessage(null);

    try {
      await postEvent("draft");

      setForm((previous) => ({
        ...previous,
        status: "draft",
      }));

      setMessage({
        type: "success",
        text: "L'événement a été enregistré comme brouillon.",
      });
    } catch (error) {
      console.error("SAVE EVENT DRAFT ERROR:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'enregistrement.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage(null);

    try {
      await postEvent("published");

      setForm((previous) => ({
        ...previous,
        status: "published",
      }));

      setMessage({
        type: "success",
        text: "L'événement a été publié.",
      });

      router.push("/institution/events");
      router.refresh();
    } catch (error) {
      console.error("PUBLISH EVENT ERROR:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors de la publication.",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleFormatChange(value: EventFormat) {
    setForm((previous) => ({
      ...previous,
      format: value,

      location:
        value === "presentiel"
          ? previous.location
          : "",

      meetingLink:
        value === "en_ligne"
          ? previous.meetingLink
          : "",
    }));

    setMessage(null);
  }

  return (
    <>
      <Header title="Créer un événement" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">
                Nouvel événement
              </Badge>

              <Badge tone="gold">
                Institution
              </Badge>
            </div>

            <p className="mt-3 max-w-3xl text-ink-soft">
              Publiez un webinaire, un atelier ou une
              séance d&apos;information à destination des
              entrepreneures.
            </p>
          </div>

          <Link href="/institution/events">
            <Button
              type="button"
              variant="outline"
            >
              <ArrowLeft size={18} />
              Retour
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* FORM */}
          <form
            className="space-y-8"
            onSubmit={submit}
          >
            {/* General information */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <CalendarDays size={22} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Informations générales
                  </h2>

                  <p className="text-sm text-ink-soft">
                    Ces informations seront visibles par
                    les entrepreneures.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Titre de l'événement"
                  placeholder="Webinaire : Financer son projet en 2026"
                  value={form.title}
                  onChange={(event) =>
                    update(
                      "title",
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

                <Select
                  label="Type d'événement"
                  value={form.type}
                  onChange={(event) =>
                    update(
                      "type",
                      event.target.value as EventType
                    )
                  }
                  disabled={saving}
                >
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

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Description
                    </span>

                    <textarea
                      rows={5}
                      disabled={saving}
                      className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Décrivez le contenu, les objectifs et le public visé par cet événement."
                      value={form.description}
                      onChange={(event) =>
                        update(
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <Input
                  label="Intervenant(e)"
                  placeholder="Nom de l'intervenant ou de l'animatrice"
                  value={form.speaker}
                  onChange={(event) =>
                    update(
                      "speaker",
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

                <Input
                  type="number"
                  min={1}
                  step={1}
                  label="Capacité maximale"
                  placeholder="100"
                  value={form.capacity}
                  onChange={(event) =>
                    update(
                      "capacity",
                      event.target.value
                    )
                  }
                  disabled={saving}
                />
              </div>
            </Card>

            {/* Date & time */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Clock size={22} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Date et horaire
                  </h2>

                  <p className="text-sm text-ink-soft">
                    Définissez quand aura lieu l'événement.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Input
                  type="date"
                  label="Date"
                  value={form.date}
                  onChange={(event) =>
                    update(
                      "date",
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

                <Input
                  type="time"
                  label="Heure de début"
                  value={form.time}
                  onChange={(event) =>
                    update(
                      "time",
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

                <Select
                  label="Durée"
                  value={form.duration}
                  onChange={(event) =>
                    update(
                      "duration",
                      event.target.value
                    )
                  }
                  disabled={saving}
                >
                  <option value="30">
                    30 minutes
                  </option>

                  <option value="60">
                    1 heure
                  </option>

                  <option value="90">
                    1 heure 30
                  </option>

                  <option value="120">
                    2 heures
                  </option>

                  <option value="180">
                    Demi-journée
                  </option>
                </Select>
              </div>
            </Card>

            {/* Location */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  {form.format === "en_ligne" ? (
                    <Video size={22} />
                  ) : (
                    <MapPin size={22} />
                  )}
                </div>

                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Lieu
                  </h2>

                  <p className="text-sm text-ink-soft">
                    Précisez si l'événement se déroule en
                    ligne ou en présentiel.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Select
                  label="Format"
                  value={form.format}
                  onChange={(event) =>
                    handleFormatChange(
                      event.target.value as EventFormat
                    )
                  }
                  disabled={saving}
                >
                  <option value="en_ligne">
                    En ligne
                  </option>

                  <option value="presentiel">
                    Présentiel
                  </option>
                </Select>

                {form.format === "en_ligne" ? (
                  <Input
                    label="Lien de la visioconférence"
                    placeholder="https://meet.google.com/..."
                    value={form.meetingLink}
                    onChange={(event) =>
                      update(
                        "meetingLink",
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />
                ) : (
                  <Input
                    label="Adresse"
                    placeholder="Sétif — Siège de l'institution"
                    value={form.location}
                    onChange={(event) =>
                      update(
                        "location",
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />
                )}
              </div>
            </Card>

            {/* Status */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <FileText size={22} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Statut
                  </h2>

                  <p className="text-sm text-ink-soft">
                    Choisissez si l'événement est visible
                    immédiatement.
                  </p>
                </div>
              </div>

              <Select
                label="Statut de publication"
                value={form.status}
                onChange={(event) =>
                  update(
                    "status",
                    event.target.value as EventStatus
                  )
                }
                disabled={saving}
              >
                <option value="draft">
                  Brouillon
                </option>

                <option value="published">
                  Publié
                </option>
              </Select>
            </Card>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/institution/events"
                className="inline-flex items-center justify-center rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50"
              >
                Annuler
              </Link>

              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && form.status === "draft" ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : null}

                Enregistrer comme brouillon
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && form.status !== "draft" ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Publication...
                  </>
                ) : (
                  <>
                    <Send size={18} />

                    Publier l'événement
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview */}
          <aside className="sticky top-6 h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <CalendarDays size={18} />
              </div>

              <div>
                <h3 className="font-bold text-ink">
                  Aperçu
                </h3>

                <p className="text-sm text-ink-soft">
                  Vue publique de l'événement
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-ink">
                  {form.title ||
                    "Titre de l'événement"}
                </h4>

                <p className="mt-1 text-sm text-ink-soft">
                  {form.type === "webinaire" &&
                    "Webinaire"}

                  {form.type === "atelier" &&
                    "Atelier"}

                  {form.type ===
                    "seance_information" &&
                    "Séance d'information"}
                </p>
              </div>

              <div className="rounded-xl bg-sand-50 p-4">
                <p className="line-clamp-4 text-sm text-ink-soft">
                  {form.description ||
                    "La description de l'événement apparaîtra ici..."}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-soft">
                    Date
                  </span>

                  <span className="text-right font-semibold text-ink">
                    {form.date || "-"}
                    {form.time &&
                      ` à ${form.time}`}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-soft">
                    Durée
                  </span>

                  <span className="font-semibold text-ink">
                    {form.duration === "30" &&
                      "30 minutes"}

                    {form.duration === "60" &&
                      "1 heure"}

                    {form.duration === "90" &&
                      "1 heure 30"}

                    {form.duration === "120" &&
                      "2 heures"}

                    {form.duration === "180" &&
                      "Demi-journée"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-soft">
                    Format
                  </span>

                  <span className="font-semibold text-ink">
                    {form.format === "en_ligne"
                      ? "En ligne"
                      : "Présentiel"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-soft">
                    Capacité
                  </span>

                  <span className="font-semibold text-ink">
                    {form.capacity || "-"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <Users size={16} />
                  Intervenant(e)
                </div>

                <p className="mt-2 text-sm text-rose-900">
                  {form.speaker ||
                    "Non renseigné"}
                </p>
              </div>

              {form.format === "presentiel" &&
                form.location && (
                  <div className="rounded-xl bg-sand-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <MapPin size={16} />
                      Adresse
                    </div>

                    <p className="mt-2 text-sm text-ink-soft">
                      {form.location}
                    </p>
                  </div>
                )}

              {form.format === "en_ligne" &&
                form.meetingLink && (
                  <div className="rounded-xl bg-sand-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Video size={16} />
                      Visioconférence
                    </div>

                    <p className="mt-2 break-all text-sm text-ink-soft">
                      {form.meetingLink}
                    </p>
                  </div>
                )}
            </div>
          </aside>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl px-5 py-4 text-sm font-semibold shadow-lg ${
            message.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}
    </>
  );
}
