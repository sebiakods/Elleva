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

type EventType = "webinaire" | "atelier" | "seance_information";
type EventFormat = "en_ligne" | "presentiel";

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

  status: "draft" | "published";
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

type Toast = { type: "success" | "error"; text: string };

export default function NewEventPage() {
  const router = useRouter();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Toast | null>(null);

  function update<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function postEvent(status: "draft" | "published") {
    const token =
      localStorage.getItem("accessToken") ?? localStorage.getItem("token");

    const res = await fetch("http://localhost:4000/api/institution/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        type: form.type,
        date: form.date,
        time: form.time,
        format: form.format,
        location: form.location,
        meetingLink: form.meetingLink,
        capacity: form.capacity ? Number(form.capacity) : null,
        speaker: form.speaker,
        isPublished: status === "published",
      }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? "Failed to save event");
    return json.data;
  }

  async function saveDraft() {
    setSaving(true);
    try {
      await postEvent("draft");
      setForm((prev) => ({ ...prev, status: "draft" }));
      setMessage({
        type: "success",
        text: "L'événement a été enregistré comme brouillon.",
      });
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await postEvent("published");
      setForm((prev) => ({ ...prev, status: "published" }));
      setMessage({ type: "success", text: "L'événement a été publié." });
      router.push("/institution/events");
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de la publication." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title="Créer un événement" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Nouvel événement</Badge>
              <Badge tone="gold">Institution</Badge>
            </div>

            <p className="mt-3 max-w-3xl text-ink-soft">
              Publiez un webinaire, un atelier ou une séance d'information à
              destination des entrepreneures.
            </p>
          </div>

          <Link href="/institution/events">
            <Button variant="outline">
              <ArrowLeft size={18} />
              Retour
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form className="space-y-8" onSubmit={submit}>
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
                    Ces informations seront visibles par les entrepreneures.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Titre de l'événement"
                  placeholder="Webinaire : Financer son projet en 2026"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />

                <Select
                  label="Type d'événement"
                  value={form.type}
                  onChange={(e) =>
                    update("type", e.target.value as EventType)
                  }
                >
                  <option value="webinaire">Webinaire</option>
                  <option value="atelier">Atelier</option>
                  <option value="seance_information">
                    Séance d'information
                  </option>
                </Select>

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Description
                    </span>
                    <textarea
                      rows={5}
                      className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                      placeholder="Décrivez le contenu, les objectifs et le public visé par cet événement."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </label>
                </div>

                <Input
                  label="Intervenant(e)"
                  placeholder="Nom de l'intervenant ou de l'animatrice"
                  value={form.speaker}
                  onChange={(e) => update("speaker", e.target.value)}
                />

                <Input
                  type="number"
                  label="Capacité maximale"
                  placeholder="100"
                  value={form.capacity}
                  onChange={(e) => update("capacity", e.target.value)}
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
                  onChange={(e) => update("date", e.target.value)}
                />

                <Input
                  type="time"
                  label="Heure de début"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                />

                <Select
                  label="Durée"
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="90">1 heure 30</option>
                  <option value="120">2 heures</option>
                  <option value="180">Demi-journée</option>
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
                  <h2 className="font-display text-2xl text-ink">Lieu</h2>
                  <p className="text-sm text-ink-soft">
                    Précisez si l'événement se déroule en ligne ou en présentiel.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Select
                  label="Format"
                  value={form.format}
                  onChange={(e) =>
                    update("format", e.target.value as EventFormat)
                  }
                >
                  <option value="en_ligne">En ligne</option>
                  <option value="presentiel">Présentiel</option>
                </Select>

                {form.format === "en_ligne" ? (
                  <Input
                    label="Lien de la visioconférence"
                    placeholder="https://meet.google.com/..."
                    value={form.meetingLink}
                    onChange={(e) => update("meetingLink", e.target.value)}
                  />
                ) : (
                  <Input
                    label="Adresse"
                    placeholder="Sétif — Siège de l'institution"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
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
                  <h2 className="font-display text-2xl text-ink">Statut</h2>
                  <p className="text-sm text-ink-soft">
                    Choisissez si l'événement est visible immédiatement.
                  </p>
                </div>
              </div>

              <Select
                label="Statut de publication"
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as "draft" | "published")
                }
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </Select>
            </Card>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <Link href="/institution/events">
                <button
                  type="button"
                  className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50"
                >
                  Annuler
                </button>
              </Link>

              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && form.status === "draft" ? (
                  <Loader2 size={18} className="animate-spin" />
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
                    <Loader2 size={18} className="animate-spin" />
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
                <h3 className="font-bold text-ink">Aperçu</h3>
                <p className="text-sm text-ink-soft">
                  Vue publique de l'événement
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-ink">
                  {form.title || "Titre de l'événement"}
                </h4>
                <p className="mt-1 text-sm text-ink-soft">
                  {form.type === "webinaire" && "Webinaire"}
                  {form.type === "atelier" && "Atelier"}
                  {form.type === "seance_information" &&
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
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Date</span>
                  <span className="font-semibold text-ink">
                    {form.date || "-"} {form.time && `à ${form.time}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Format</span>
                  <span className="font-semibold text-ink">
                    {form.format === "en_ligne" ? "En ligne" : "Présentiel"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Capacité</span>
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
                  {form.speaker || "Non renseigné"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {message && (
        <div
          className={`fixed bottom-6 right-6 rounded-xl px-5 py-4 text-sm font-semibold shadow-lg ${
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