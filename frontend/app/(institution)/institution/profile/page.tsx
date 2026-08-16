"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import {
  Building2, UploadCloud, X, Globe, Mail, Phone, MapPin,
  Save, Loader2, Linkedin, Facebook,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { authFetch } from "@/lib/authFetch";

type InstitutionType = "banque" | "fonds_investissement" | "ong" | "incubateur" | "organisme_public";

type ProfileForm = {
  name: string;
  type: InstitutionType;
  shortDescription: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  linkedin: string;
  facebook: string;
};

const emptyForm: ProfileForm = {
  name: "",
  type: "fonds_investissement",
  shortDescription: "",
  description: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  region: "Sétif",
  linkedin: "",
  facebook: "",
};

type Toast = { type: "success" | "error"; text: string };

const TYPE_LABELS: Record<InstitutionType, string> = {
  banque: "Banque",
  fonds_investissement: "Fonds d'investissement",
  ong: "ONG",
  incubateur: "Incubateur",
  organisme_public: "Organisme public",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const ASSET_ORIGIN = API_BASE.replace(/\/api$/, "");

export default function InstitutionProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Toast | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE}/institution-profile/me`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Erreur lors du chargement du profil");

        const p = json.data;
        setForm({
          name: p.institutionName ?? "",
          type: (p.type as InstitutionType) ?? "fonds_investissement",
          shortDescription: p.shortDescription ?? "",
          description: p.description ?? "",
          website: p.websiteUrl ?? "",
          email: p.contactEmail ?? "",
          phone: p.contactPhone ?? "",
          address: p.address ?? "",
          region: p.city ?? "Sétif",
          linkedin: p.linkedinUrl ?? "",
          facebook: p.facebookUrl ?? "",
        });
        setExistingLogoUrl(p.logoUrl ?? null);
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

  function handleLogoSelect(selected: File | null) {
    if (!selected) return;
    setLogo(selected);
    setLogoPreview(URL.createObjectURL(selected));
  }

  function removeLogo() {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogo(null);
    setLogoPreview(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("type", form.type);
      fd.append("shortDescription", form.shortDescription);
      fd.append("description", form.description);
      fd.append("website", form.website);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      fd.append("region", form.region);
      fd.append("linkedin", form.linkedin);
      fd.append("facebook", form.facebook);
      if (logo) fd.append("logo", logo);

      const res = await authFetch(`${API_BASE}/institution-profile/me`, {
        method: "PATCH",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Échec de l'enregistrement");

      if (json.data.logoUrl) setExistingLogoUrl(json.data.logoUrl);
      setLogo(null);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);

      setMessage({ type: "success", text: "Le profil a été mis à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  }

  const initials = form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const displayedLogo = logoPreview || (existingLogoUrl ? `${ASSET_ORIGIN}${existingLogoUrl}` : null);

  if (loading) {
    return (
      <>
        <div className="mx-auto max-w-7xl py-16 text-center text-ink-soft">Chargement...</div>
      </>
    );
  }

  return (
    <>
{/* Breadcrumb */}
<div className="mb-8 text-sm text-ink-soft">
  <span>Espace Institution</span>
  <span className="mx-2 text-ink-soft/40">/</span>
  <span className="font-medium text-wine-700">Profil</span>
</div>

{/* Header Section */}
<div className="relative mb-10">
  <div
    aria-hidden
    className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
  />

  <p className="font-script text-2xl leading-none text-rose-500">
    Votre institution
  </p>

  <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
    Profil -{" "}
    <span className="text-gradient-rise">Mon institution</span>
  </h1>

  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
    Consultez et gérez les informations de votre institution.
  </p>
</div>

      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Badge tone="rose">Profil public</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-ink-soft">
            Modifiez la présentation publique de votre institution : logo, description, coordonnées, site web et localisation.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form className="space-y-8" onSubmit={submit}>
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">Logo et identité</h2>
                  <p className="text-sm text-ink-soft">Ces informations apparaîtront dans l'annuaire public.</p>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-rose-100 text-2xl font-display text-rose-700">
                  {displayedLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayedLogo} alt="Logo de l'institution" className="h-full w-full object-cover" />
                  ) : (
                    initials || <Building2 size={28} />
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
                      {displayedLogo ? "Changer le logo" : "Téléverser un logo"}
                    </button>

                    {logo && (
                      <button
                        type="button"
                        onClick={removeLogo}
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
                    onChange={(e) => handleLogoSelect(e.target.files?.[0] ?? null)}
                  />

                  <p className="text-xs text-ink-soft">
                    {logo ? `${logo.name} · ${formatFileSize(logo.size)}` : "PNG, JPG ou SVG, 512×512px recommandé."}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Nom de l'institution"
                  placeholder="Fonds Innovation Femmes"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />

                <Select label="Type d'institution" value={form.type} onChange={(e) => update("type", e.target.value as InstitutionType)}>
                  <option value="banque">Banque</option>
                  <option value="fonds_investissement">Fonds d'investissement</option>
                  <option value="ong">ONG</option>
                  <option value="incubateur">Incubateur</option>
                  <option value="organisme_public">Organisme public</option>
                </Select>

                <div className="md:col-span-2">
                  <Input
                    label="Courte description"
                    placeholder="Une phrase qui résume votre mission"
                    value={form.shortDescription}
                    onChange={(e) => update("shortDescription", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">Description complète</span>
                    <textarea
                      rows={6}
                      className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                      placeholder="Présentez votre mission, votre histoire et vos domaines d'intervention."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </Card>

            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Mail size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">Coordonnées</h2>
                  <p className="text-sm text-ink-soft">Comment les entrepreneures peuvent vous contacter.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Site web" placeholder="https://..." value={form.website} onChange={(e) => update("website", e.target.value)} />
                <Input type="email" label="Adresse e-mail" placeholder="contact@institution.dz" value={form.email} onChange={(e) => update("email", e.target.value)} />
                <Input label="Téléphone" placeholder="+213 ..." value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </Card>

            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <MapPin size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">Localisation</h2>
                  <p className="text-sm text-ink-soft">Adresse affichée dans l'annuaire des institutions.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Adresse" placeholder="Cité administrative, Sétif" value={form.address} onChange={(e) => update("address", e.target.value)} />
                <Select label="Wilaya" value={form.region} onChange={(e) => update("region", e.target.value)}>
                  <option>Sétif</option>
                  <option>Alger</option>
                  <option>Oran</option>
                  <option>Constantine</option>
                  <option>Annaba</option>
                  <option>Batna</option>
                </Select>
              </div>
            </Card>

            <Card hover={false}>
              <div className="mb-6">
                <h2 className="font-display text-2xl text-ink">Réseaux sociaux (optionnel)</h2>
                <p className="text-sm text-ink-soft">Ajoutez vos liens pour renforcer votre visibilité.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative">
                  <Linkedin size={16} className="pointer-events-none absolute left-4 top-[42px] text-ink-soft" />
                  <Input label="LinkedIn" placeholder="https://linkedin.com/company/..." value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
                </div>
                <div className="relative">
                  <Facebook size={16} className="pointer-events-none absolute left-4 top-[42px] text-ink-soft" />
                  <Input label="Facebook" placeholder="https://facebook.com/..." value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
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

          <aside className="sticky top-6 h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-ink">Aperçu</h3>
                <p className="text-sm text-ink-soft">Vue dans l'annuaire des institutions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-rose-100 text-lg font-display text-rose-700">
                {displayedLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayedLogo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  initials || <Building2 size={22} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg text-ink">{form.name || "Nom de l'institution"}</p>
                <p className="text-xs text-ink-soft">{TYPE_LABELS[form.type]}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-soft">{form.shortDescription || "La courte description apparaîtra ici..."}</p>

            <div className="mt-4 space-y-2 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                {form.address || "-"}
                {form.region && `, ${form.region}`}
              </div>
              {form.website && (
                <div className="flex items-center gap-2">
                  <Globe size={14} />
                  <span className="truncate">{form.website}</span>
                </div>
              )}
              {form.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span className="truncate">{form.email}</span>
                </div>
              )}
              {form.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  {form.phone}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {message && (
        <div
          className={`fixed bottom-6 right-6 rounded-xl px-5 py-4 text-sm font-semibold shadow-lg ${
            message.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}
    </>
  );
}