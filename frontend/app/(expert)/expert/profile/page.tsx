"use client";

import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from "react";
import { User, UploadCloud, X, Save, Loader2, Linkedin, Globe, Star, Users, BadgeCheck, Plus } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { authFetch } from "@/lib/authFetch";
import { API_BASE_URL } from "@/services/api";



type ProfileForm = {
  name: string;
  bio: string;
  title: string;
  specialties: string[];
  sessionRateDA: string;
  availableForBooking: boolean;
  linkedinUrl: string;
  websiteUrl: string;
};

const emptyForm: ProfileForm = {
  name: "",
  bio: "",
  title: "",
  specialties: [],
  sessionRateDA: "",
  availableForBooking: true,
  linkedinUrl: "",
  websiteUrl: "",
};

type Toast = { type: "success" | "error"; text: string };

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const ASSET_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default function ExpertProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [stats, setStats] = useState<{ rating: number; reviewCount: number; sessionCount: number; isApprovedByAdmin: boolean } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Toast | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await authFetch("/expert-profile/me");
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Erreur lors du chargement du profil");

        const p = json.data;
        const ep = p.expertProfile;
        setForm({
          name: p.name ?? "",
          bio: p.bio ?? "",
          title: ep.title ?? "",
          specialties: ep.specialties ?? [],
          sessionRateDA: ep.sessionRateDA != null ? String(ep.sessionRateDA) : "",
          availableForBooking: ep.availableForBooking ?? true,
          linkedinUrl: ep.linkedinUrl ?? "",
          websiteUrl: ep.websiteUrl ?? "",
        });
        setExistingAvatarUrl(p.avatarUrl ?? null);
        setStats({
          rating: ep.rating ?? 0,
          reviewCount: ep.reviewCount ?? 0,
          sessionCount: ep.sessionCount ?? 0,
          isApprovedByAdmin: ep.isApprovedByAdmin ?? false,
        });
      } catch (err) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  function addSpecialty() {
    const value = specialtyInput.trim();
    if (!value || form.specialties.includes(value)) {
      setSpecialtyInput("");
      return;
    }
    update("specialties", [...form.specialties, value]);
    setSpecialtyInput("");
  }

  function removeSpecialty(value: string) {
    update("specialties", form.specialties.filter((s) => s !== value));
  }

  function handleSpecialtyKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSpecialty();
    }
  }

  function handleAvatarSelect(selected: File | null) {
    if (!selected) return;
    setAvatar(selected);
    setAvatarPreview(URL.createObjectURL(selected));
  }

  function removeAvatar() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatar(null);
    setAvatarPreview(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("bio", form.bio);
      fd.append("title", form.title);
      fd.append("specialties", JSON.stringify(form.specialties));
      fd.append("sessionRateDA", form.sessionRateDA || "0");
      fd.append("availableForBooking", String(form.availableForBooking));
      fd.append("linkedinUrl", form.linkedinUrl);
      fd.append("websiteUrl", form.websiteUrl);
      if (avatar) fd.append("avatar", avatar);
      const res = await authFetch("/expert-profile/me", {
   
        method: "PATCH",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Échec de l'enregistrement");

      if (json.data.avatarUrl) setExistingAvatarUrl(json.data.avatarUrl);
      setAvatar(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);

      setMessage({ type: "success", text: "Le profil a été mis à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  }

  const initials = form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const displayedAvatar = avatarPreview || (existingAvatarUrl ? `${ASSET_ORIGIN}${existingAvatarUrl}` : null);

  return (
    <div className="px-6 sm:px-8 py-4 space-y-6 max-w-7xl mx-auto">
      <div className="text-sm text-ink-soft">
        <span>Espace Experte</span>
        <span className="mx-2 text-ink-soft/40">/</span>
        <span className="font-medium text-wine-700">Profil</span>
      </div>

      <div className="relative mb-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <p className="font-script text-2xl leading-none text-rose-500">Présentation</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          Mon <span className="text-gradient-rise">profil public</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Valorisez votre parcours, gérez vos compétences et mettez à jour la carte de présentation visible par l'ensemble des entrepreneures.
        </p>
      </div>

      {loading ? (
        <Card hover={false}><p className="py-10 text-center text-ink-soft">Chargement...</p></Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form className="space-y-8" onSubmit={submit}>
            {/* Avatar & identity */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">Identité</h2>
                  <p className="text-sm text-ink-soft">Ces informations apparaîtront sur votre carte publique.</p>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-rose-100 text-2xl font-display text-rose-700">
                  {displayedAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayedAvatar} alt="Photo de profil" className="h-full w-full object-cover" />
                  ) : (
                    initials || <User size={28} />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl border border-sand-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand-50"
                    >
                      <UploadCloud size={16} />
                      {displayedAvatar ? "Changer la photo" : "Téléverser une photo"}
                    </button>

                    {avatar && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="flex items-center gap-2 rounded-xl border border-sand-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <X size={16} />
                        Retirer
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
                  />

                  <p className="text-xs text-ink-soft">
                    {avatar ? `${avatar.name} · ${formatFileSize(avatar.size)}` : "PNG ou JPG, format carré recommandé."}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Nom complet" placeholder="Amina Bensalem" value={form.name} onChange={(e) => update("name", e.target.value)} />
                <Input label="Titre professionnel" placeholder="Consultante en stratégie d'entreprise" value={form.title} onChange={(e) => update("title", e.target.value)} />

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">Bio</span>
                    <textarea
                      rows={6}
                      className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                      placeholder="Présentez votre parcours, votre expertise et ce que vous pouvez apporter aux entrepreneures."
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </Card>

            {/* Specialties */}
            <Card hover={false}>
              <div className="mb-6">
                <h2 className="font-display text-2xl text-ink">Domaines d'expertise</h2>
                <p className="text-sm text-ink-soft">Ajoutez des mots-clés pour être facilement trouvée.</p>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {form.specialties.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700"
                  >
                    {s}
                    <button type="button" onClick={() => removeSpecialty(s)} className="text-rose-600 hover:text-rose-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {form.specialties.length === 0 && (
                  <p className="text-sm text-ink-soft">Aucune spécialité ajoutée.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ex : Marketing digital, Finance..."
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={handleSpecialtyKeyDown}
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-sand-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand-50"
                >
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>
            </Card>

            {/* Booking */}
            <Card hover={false}>
              <div className="mb-6">
                <h2 className="font-display text-2xl text-ink">Disponibilité et tarif</h2>
                <p className="text-sm text-ink-soft">Paramètres visibles lors de la prise de rendez-vous.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  type="number"
                  label="Tarif par session (DA)"
                  placeholder="5000"
                  value={form.sessionRateDA}
                  onChange={(e) => update("sessionRateDA", e.target.value)}
                />

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">Disponible pour réservation</span>
                  <button
                    type="button"
                    onClick={() => update("availableForBooking", !form.availableForBooking)}
                    className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-4 text-sm font-semibold transition ${
                      form.availableForBooking
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-sand-200 bg-sand-50 text-ink-soft"
                    }`}
                  >
                    {form.availableForBooking ? "Oui, je suis disponible" : "Non, indisponible pour le moment"}
                    <span
                      className={`h-5 w-9 rounded-full transition ${form.availableForBooking ? "bg-emerald-500" : "bg-sand-300"}`}
                    >
                      <span
                        className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                          form.availableForBooking ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Links */}
            <Card hover={false}>
              <div className="mb-6">
                <h2 className="font-display text-2xl text-ink">Liens (optionnel)</h2>
                <p className="text-sm text-ink-soft">Ajoutez vos liens pour renforcer votre crédibilité.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative">
                  <Linkedin size={16} className="pointer-events-none absolute left-4 top-[42px] text-ink-soft" />
                  <Input label="LinkedIn" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
                </div>
                <div className="relative">
                  <Globe size={16} className="pointer-events-none absolute left-4 top-[42px] text-ink-soft" />
                  <Input label="Site web" placeholder="https://..." value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} />
                </div>
              </div>
            </Card>

            <div className="flex justify-end border-t border-sand-200 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview / Stats */}
          <aside className="sticky top-6 h-fit space-y-6">
            <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-ink">Aperçu</h3>
                  <p className="text-sm text-ink-soft">Carte visible par les entrepreneures</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-rose-100 text-lg font-display text-rose-700">
                  {displayedAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayedAvatar} alt="Photo" className="h-full w-full object-cover" />
                  ) : (
                    initials || <User size={22} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-ink">{form.name || "Nom de l'experte"}</p>
                  <p className="truncate text-xs text-ink-soft">{form.title || "Titre professionnel"}</p>
                </div>
              </div>

              <p className="mt-4 line-clamp-4 text-sm text-ink-soft">{form.bio || "La bio apparaîtra ici..."}</p>

              {form.specialties.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {form.specialties.slice(0, 4).map((s) => (
                    <Badge key={s} tone="rose">{s}</Badge>
                  ))}
                </div>
              )}

              {form.sessionRateDA && (
                <p className="mt-4 text-sm font-semibold text-ink">{form.sessionRateDA} DA / session</p>
              )}
            </div>

            {stats && (
              <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-ink">Statistiques</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-soft"><Star size={14} />Note</span>
                    <span className="font-semibold text-ink">{stats.rating.toFixed(1)} / 5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Avis reçus</span>
                    <span className="font-semibold text-ink">{stats.reviewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-soft"><Users size={14} />Sessions données</span>
                    <span className="font-semibold text-ink">{stats.sessionCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-soft"><BadgeCheck size={14} />Statut</span>
                    <span className={`font-semibold ${stats.isApprovedByAdmin ? "text-emerald-600" : "text-amber-600"}`}>
                      {stats.isApprovedByAdmin ? "Approuvée" : "En attente d'approbation"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {message && (
        <div
          className={`fixed bottom-6 right-6 rounded-xl px-5 py-4 text-sm font-semibold shadow-lg ${
            message.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
