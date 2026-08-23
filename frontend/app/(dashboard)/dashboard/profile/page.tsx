"use client";

import { useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";
import { Camera, Loader2, Mail, Phone, User, Sparkle, Heart } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  language: string;
};

const INITIAL_PROFILE: ProfileForm = {
  fullName: "Amina Kaddour",
  email: "amina@email.com",
  phone: "+213 555 00 00 00",
  language: "fr",
};

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>(INITIAL_PROFILE);

  const [avatar, setAvatar] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>(
    {}
  );

  const initials = useMemo(() => {
    return form.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [form.fullName]);

  function updateField<K extends keyof ProfileForm>(
    field: K,
    value: ProfileForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setSuccessMessage("");
  }

  function validate() {
    const newErrors: Partial<Record<keyof ProfileForm, string>> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Le nom est obligatoire.";
    }

    if (!form.email.trim()) {
      newErrors.email = "L'adresse e-mail est obligatoire.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      newErrors.email = "Adresse e-mail invalide.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est obligatoire.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    // Fake request
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setSaving(false);

    setSuccessMessage(
      "Les informations ont été enregistrées localement. La connexion au serveur sera ajoutée prochainement."
    );
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Entrepreneuse</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Mon profil</span>
        </div>

        {/* Header */}
        <div className="relative mb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Vue d&apos;ensemble
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Mon <span className="text-gradient-rise">profil</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Personnalisez vos informations afin que les mentors, investisseurs
            et partenaires puissent mieux vous connaître.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white shadow-card">
          {/* Profile hero */}
          <div className="relative overflow-hidden bg-rise-gradient p-8 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <Heart
              aria-hidden
              size={16}
              className="pointer-events-none absolute right-8 top-8 text-white/40"
              fill="currentColor"
            />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20 text-3xl font-bold shadow-lg">
                    {initials}
                  </div>
                )}

                <button
                  type="button"
                  onClick={openFilePicker}
                  className="focus-ring absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-lg transition hover:scale-105"
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="flex-1">
                <p className="font-script text-lg leading-none text-white/80">
                  Bonjour,
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {form.fullName}
                </h2>

                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                  <Sparkle size={11} />
                  Entrepreneure · Membre depuis 2025
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Nom complet"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Votre nom"
                />

                {errors.fullName && (
                  <p className="mt-1 text-sm text-rose-500">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  label="Adresse e-mail"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="nom@email.com"
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-rose-500">{errors.email}</p>
                )}
              </div>

              <div>
                <Input
                  label="Téléphone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+213 ..."
                />

                {errors.phone && (
                  <p className="mt-1 text-sm text-rose-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <Select
                  label="Langue préférée"
                  value={form.language}
                  onChange={(e) => updateField("language", e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </Select>
              </div>

              {/* Account info */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-rose-100/70 bg-sand-50 p-5 sm:col-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rise-gradient-soft opacity-50 blur-2xl"
                />

                <p className="font-script relative text-lg leading-none text-rose-400">
                  En bref
                </p>
                <h3 className="relative mt-1.5 mb-4 font-display text-lg font-semibold text-wine-900">
                  Informations du compte
                </h3>

                <div className="relative grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                      <User size={18} />
                    </div>

                    <p className="text-xs uppercase tracking-wide text-ink-soft/70">
                      Statut
                    </p>

                    <p className="mt-1 font-medium text-ink">
                      Entrepreneure
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-wine-50 text-wine-600">
                      <Mail size={18} />
                    </div>

                    <p className="text-xs uppercase tracking-wide text-ink-soft/70">
                      E-mail
                    </p>

                    <p className="mt-1 break-all font-medium text-ink">
                      {form.email}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Phone size={18} />
                    </div>

                    <p className="text-xs uppercase tracking-wide text-ink-soft/70">
                      Téléphone
                    </p>

                    <p className="mt-1 font-medium text-ink">
                      {form.phone || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 sm:col-span-2">
                  <Sparkle size={15} className="mt-0.5 shrink-0" />
                  {successMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-rose-100/70 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-soft">
                  Les modifications sont enregistrées localement. La
                  synchronisation avec votre compte sera ajoutée lorsque le
                  backend sera connecté.
                </p>

                <Button type="submit" size="lg" className="min-w-[220px] shrink-0">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Enregistrement...
                    </span>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
