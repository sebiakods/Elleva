"use client";

import { useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";
import { Camera, Loader2, Mail, Phone, User } from "lucide-react";

import { Header } from "@/components/layout/Header";
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
    <>
      <Header title="Mon profil" />

      <div className="mx-auto max-w-3xl">
        <div className="card-surface overflow-hidden shadow-card">

          {/* Header */}

          <div className="bg-rise-gradient p-8 text-white">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              <div className="relative">

                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20 text-3xl font-bold">
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

                <h2 className="font-display text-2xl font-semibold">
                  {form.fullName}
                </h2>

                <p className="mt-1 text-sm text-white/90">
                  Entrepreneure · Membre depuis 2025
                </p>

                <p className="mt-3 max-w-lg text-sm text-white/80">
                  Personnalisez votre profil afin que les mentors,
                  investisseurs et partenaires puissent mieux vous connaître.
                </p>

              </div>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 p-8"
          >

            <div className="grid gap-6 sm:grid-cols-2">

              <div>

                <Input
                  label="Nom complet"
                  value={form.fullName}
                  onChange={(e) =>
                    updateField("fullName", e.target.value)
                  }
                  placeholder="Votre nom"
                />

                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fullName}
                  </p>
                )}

              </div>

              <div>

                <Input
                  type="email"
                  label="Adresse e-mail"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="nom@email.com"
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

              <div>

                <Input
                  label="Téléphone"
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                  placeholder="+213 ..."
                />

                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phone}
                  </p>
                )}

              </div>

              <div>

                <Select
                  label="Langue préférée"
                  value={form.language}
                  onChange={(e) =>
                    updateField("language", e.target.value)
                  }
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </Select>

              </div>
              <div className="rounded-2xl border border-sand-200 bg-sand-50 p-5 sm:col-span-2">
                <h3 className="mb-4 font-display text-lg text-ink">
                  Informations du compte
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                      <User size={18} />
                    </div>

                    <p className="text-xs uppercase tracking-wide text-ink-soft">
                      Statut
                    </p>

                    <p className="mt-1 font-medium text-ink">
                      Entrepreneure
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                      <Mail size={18} />
                    </div>

                    <p className="text-xs uppercase tracking-wide text-ink-soft">
                      E-mail
                    </p>

                    <p className="mt-1 break-all font-medium text-ink">
                      {form.email}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500">
                      <Phone size={18} />
                    </div>

                    <p className="text-xs uppercase tracking-wide text-ink-soft">
                      Téléphone
                    </p>

                    <p className="mt-1 font-medium text-ink">
                      {form.phone || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-sand-200 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-soft">
                  Les modifications sont enregistrées localement.
                  La synchronisation avec votre compte sera ajoutée
                  lorsque le backend sera connecté.
                </p>

                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[220px]"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
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
    </>
  );
}