"use client";

import { useEffect, useState } from "react";
import { Calendar, Video, Users, Link2, Bell, X, Search, RefreshCw } from "lucide-react";
import { listMyEntrepreneurs, EntrepreneurSummary } from "@/lib/api/entrepreneurs";
import { createMeeting, listMyMeetings, Meeting } from "@/lib/api/meetings";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MeetingPage() {
  const [entrepreneurs, setEntrepreneurs] = useState<EntrepreneurSummary[]>([]);
  const [loadingEntrepreneurs, setLoadingEntrepreneurs] = useState(true);
  const [entrepreneursError, setEntrepreneursError] = useState<string | null>(null);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  const [openMembers, setOpenMembers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<EntrepreneurSummary[]>([]);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntrepreneurs();
    refreshMeetings();
  }, []);

  async function loadEntrepreneurs() {
    setLoadingEntrepreneurs(true);
    setEntrepreneursError(null);
    try {
      const data = await listMyEntrepreneurs();
      setEntrepreneurs(data);
    } catch (e: unknown) {
      console.error("listMyEntrepreneurs failed:", e);
      setEntrepreneursError(e instanceof Error ? e.message : "Impossible de charger les entrepreneures.");
    } finally {
      setLoadingEntrepreneurs(false);
    }
  }

  function refreshMeetings() {
    setLoadingMeetings(true);
    listMyMeetings()
      .then(setMeetings)
      .catch((e) => console.error("listMyMeetings failed:", e))
      .finally(() => setLoadingMeetings(false));
  }

  const filteredUsers = entrepreneurs.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleUser(user: EntrepreneurSummary) {
    const exists = selectedUsers.some((u) => u.id === user.id);
    setSelectedUsers(exists ? selectedUsers.filter((u) => u.id !== user.id) : [...selectedUsers, user]);
  }

async function handleCreate() {
  setError(null);

  const missing: string[] = [];
  if (!title.trim()) missing.push("le titre");
  if (!platform) missing.push("la plateforme");
  if (!meetingUrl.trim()) missing.push("le lien");
  if (!scheduledAt) missing.push("la date et l'heure (sélectionnez aussi l'heure, pas seulement le jour)");

  if (missing.length > 0) {
    setError(`Merci de renseigner : ${missing.join(", ")}.`);
    return;
  }
  if (selectedUsers.length === 0) {
    setError("Sélectionnez au moins un membre à inviter.");
    return;
  }

  setSubmitting(true);
  try {
    await createMeeting({
      title: title.trim(),
      platform,
      meetingUrl: meetingUrl.trim(),
      scheduledAt,
      notes: notes.trim() || undefined,
      participantIds: selectedUsers.map((u) => u.id),
    });
    setTitle("");
    setPlatform("");
    setMeetingUrl("");
    setScheduledAt("");
    setNotes("");
    setSelectedUsers([]);
    refreshMeetings();
    alert("Réunion créée. Les entrepreneures invitées ont été notifiées.");
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Erreur lors de la création de la réunion");
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Réunions</h1>
          <p className="mt-2 text-gray-600">Organisez vos rendez-vous avec les entrepreneures.</p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-8 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-wine-50 p-3 text-wine-600">
            <Video size={22} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Créer une réunion</h2>
            <p className="text-sm text-gray-500">Ajoutez un lien et invitez les membres.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Titre de la réunion"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-2xl border border-sand-200 bg-sand-50 p-3"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-2xl border border-sand-200 bg-sand-50 p-3"
          >
            <option value="">Plateforme</option>
            <option>Google Meet</option>
            <option>Zoom</option>
            <option>Microsoft Teams</option>
          </select>
          <input
            placeholder="Lien de réunion"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className="rounded-2xl border border-sand-200 bg-sand-50 p-3"
          />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded-2xl border border-sand-200 bg-sand-50 p-3"
          />
          <textarea
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="rounded-2xl border border-sand-200 bg-sand-50 p-3 md:col-span-2"
          />
        </div>

        <div className="mt-6">
          <label className="mb-3 flex items-center gap-2 font-semibold">
            <Users size={18} />
            Membres invités
          </label>

          <button
            onClick={() => setOpenMembers(true)}
            className="w-full rounded-2xl border border-sand-200 bg-sand-50 p-4 text-left hover:border-rose-300 transition"
          >
            + Sélectionner les membres
          </button>

          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <span
                key={user.id}
                className="flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm text-wine-700"
              >
                {user.name}
                <X size={14} className="cursor-pointer" onClick={() => toggleUser(user)} />
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={submitting}
          className="mt-6 flex items-center gap-2 rounded-full bg-wine-600 px-6 py-3 font-semibold text-white hover:bg-wine-700 transition disabled:opacity-60"
        >
          <Bell size={18} />
          {submitting ? "Création..." : "Créer et envoyer les notifications"}
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">Réunions à venir</h2>
        {loadingMeetings && <p className="mt-4 text-sm text-ink-soft">Chargement...</p>}
        {!loadingMeetings && meetings.length === 0 && (
          <p className="mt-4 text-sm text-ink-soft">Aucune réunion planifiée.</p>
        )}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold">{meeting.title}</h3>
              <p className="mt-1 text-gray-600">{meeting.participants.map((p) => p.user.name).join(", ")}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                {formatDateTime(meeting.scheduledAt)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Link2 size={16} />
                {meeting.platform}
              </div>
              
              {/* FIXED: Restored missing opening <a> tag */}
              <a
                href={meeting.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block w-full rounded-full border border-rose-300 py-3 text-center font-semibold text-wine-600 hover:bg-rose-50"
              >
                Rejoindre
              </a>
            </div>
          ))}
        </div>
      </div>

      {openMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Inviter des membres</h2>
            <p className="mt-1 text-sm text-gray-500">Sélectionnez les entrepreneures.</p>

            <div className="mt-5 flex items-center gap-2 rounded-2xl border p-3">
              <Search size={18} />
              <input
                placeholder="Rechercher..."
                className="outline-none flex-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
              {loadingEntrepreneurs && (
                <p className="py-4 text-center text-sm text-ink-soft">Chargement des entrepreneures...</p>
              )}

              {!loadingEntrepreneurs && entrepreneursError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-center">
                  <p className="text-sm text-rose-600">{entrepreneursError}</p>
                  <button
                    onClick={loadEntrepreneurs}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:underline"
                  >
                    <RefreshCw size={12} />
                    Réessayer
                  </button>
                </div>
              )}

              {!loadingEntrepreneurs && !entrepreneursError && filteredUsers.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-soft">
                  Aucune entrepreneure trouvée. Elles apparaissent ici une fois qu'elles ont soumis un
                  business plan ou réservé une session avec vous.
                </p>
              )}

              {!loadingEntrepreneurs &&
                !entrepreneursError &&
                filteredUsers.map((user) => {
                  const checked = selectedUsers.some((u) => u.id === user.id);
                  return (
                    <label
                      key={user.id}
                      className="flex items-center justify-between rounded-2xl border p-4 cursor-pointer hover:bg-sand-50"
                    >
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <input type="checkbox" checked={checked} onChange={() => toggleUser(user)} />
                    </label>
                  );
                })}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenMembers(false)} className="rounded-full px-5 py-2 text-gray-600">
                Annuler
              </button>
              <button onClick={() => setOpenMembers(false)} className="rounded-full bg-wine-600 px-6 py-2 text-white">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}