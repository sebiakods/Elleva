"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  DollarSign,
  FileText,
  Landmark,
  Mail,
  Users,
  Trash2,
  Plus,
  Loader2,
  Eye,
  Send,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";


interface ProgramFormProps {
  mode: "create" | "edit";
  program?: any;
}

type ProgramForm = {
  title: string;
  shortDescription: string;
  description: string;

  category: string;
  sector: string;
  fundingType: string;

  minAmount: string;
  maxAmount: string;
  currency: string;

  openingDate: string;
  closingDate: string;

  region: string;

  targetAudience: string;
  eligibilityCriteria: string;
  documents: string[];

  website: string;
  email: string;
  phone: string;

  status: "draft" | "published";
};

const initialForm: ProgramForm = {
  title: "",
  shortDescription: "",
  description: "",

  category: "",
  sector: "",
  fundingType: "",

  minAmount: "",
  maxAmount: "",
  currency: "DZD",

  openingDate: "",
  closingDate: "",

  region: "Algérie",

  targetAudience: "",
  eligibilityCriteria: "",
  documents: [""],

  website: "",
  email: "",
  phone: "",

  status: "draft",
};

type Toast = { type: "success" | "error"; text: string };

export default function ProgramForm({
  mode,
  program,
}: ProgramFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProgramForm>(initialForm);

useEffect(() => {
  if (!program) return;

  setForm({
    ...initialForm,

    title: program.title ?? "",
    shortDescription: program.shortDescription ?? "",
    description: program.description ?? "",

    category: program.category ?? "",
    sector: program.sector ?? "",
    fundingType: program.fundingType ?? "",

    minAmount: program.amountMin?.toString() ?? "",
    maxAmount: program.amountMax?.toString() ?? "",
    currency: program.currency ?? "DZD",

    openingDate: program.openingDate?.slice(0, 10) ?? "",
    closingDate: program.closingDate?.slice(0, 10) ?? "",

    region: program.region ?? "Algérie",

    targetAudience: program.targetAudience ?? "",

    eligibilityCriteria:
      program.eligibility?.join("\n") ?? "",

    documents:
      program.requiredDocuments?.length
        ? program.requiredDocuments
        : [""],

    website: program.website ?? "",
    email: program.email ?? "",
    phone: program.phone ?? "",

    status: program.status ?? "draft",
  });
}, [program]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Toast | null>(null);

  function update<K extends keyof ProgramForm>(key: K, value: ProgramForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setMessage(null);
  }

  function updateDocument(index: number, value: string) {
    setForm((prev) => {
      const documents = [...prev.documents];
      documents[index] = value;
      return { ...prev, documents };
    });
  }

  function addDocument() {
    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, ""],
    }));
  }

  function removeDocument(index: number) {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  }

  async function saveDraft() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);

    setForm((prev) => ({ ...prev, status: "draft" }));
    setMessage({
      type: "success",
      text: "Le programme a été enregistré comme brouillon.",
    });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  try {
    setSaving(true);

   const token =
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token");

    if (!token) {
      setSaving(false);

      setMessage({
        type: "error",
        text: "Veuillez vous reconnecter.",
      });

      return;
    }

const body = {
  slug: form.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, ""),

  title: form.title,

  shortDescription: form.shortDescription,

  description: form.description,

  category: form.category,

  sector: form.sector,

  amountMin:
    form.minAmount.trim() === ""
      ? null
      : Number(form.minAmount),

  amountMax:
    form.maxAmount.trim() === ""
      ? null
      : Number(form.maxAmount),

  fundingType: form.fundingType,

  openingDate: form.openingDate,

  closingDate: form.closingDate,

  region: form.region,

  website: form.website,

  email: form.email,

  phone: form.phone,

  status: form.status,

  eligibility: form.eligibilityCriteria
    .split("\n")
    .filter(Boolean),

  requiredDocuments: form.documents.filter(Boolean),
  currency: form.currency,

  targetAudience: form.targetAudience,
};


if (mode === "edit" && !program?.id) {
  throw new Error("Programme introuvable.");
}

if (mode === "edit" && !program?.id) {
  throw new Error("Programme introuvable.");
}

const url =
  mode === "create"
    ? `${process.env.NEXT_PUBLIC_API_URL}/programs`
    : `${process.env.NEXT_PUBLIC_API_URL}/programs/${program.id}`;
    console.log("POST URL:", url);
    console.log("TOKEN:", token);
    console.log("BODY:", body);

    const response = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    let data: any = {};

try {
  data = await response.json();
} catch {
  data = {};
}

  if (!response.ok) {
    console.log("BACKEND ERROR:", data);
    throw new Error(JSON.stringify(data));
  }

    setMessage({
      type: "success",
      text:
        mode === "create"
          ? "Programme créé avec succès."
          : "Programme modifié avec succès.",
    });

    router.push("/institution/programs");
    router.refresh();
  } catch (err) {
  setMessage({
    type: "error",
    text:
      err instanceof Error
        ? err.message
        : "Erreur inconnue",
  });
} finally {
    setSaving(false);
  }
}
  return (
    <>
      <Header
  title={
    mode === "create"
      ? "Publier un programme"
      : "Modifier le programme"
  }
/>

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="wine">Nouveau programme</Badge>
              <Badge tone="gold">Institution</Badge>
            </div>

            <h1 className="font-display text-4xl text-ink">
              {mode === "create"
  ? "Créer un programme de financement"
  : "Modifier le programme"}
            </h1>

            <p className="mt-3 max-w-3xl text-ink-soft">
              Définissez les informations de votre programme, les montants,
              les critères d'éligibilité, les dates importantes ainsi que les
              coordonnées de contact avant la publication.
            </p>
          </div>

          <Link href="/institution/programs">
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
                  <Landmark size={22} />
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
                  label="Nom du programme"
                  placeholder="Programme Innovation Femmes 2026"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />

                <Select
                  label="Catégorie"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="">Sélectionner...</option>

                  <option value="GOVERNMENT_GRANT">
                    Subvention
                  </option>

                  <option value="BANK_LOAN">
                    Prêt bancaire
                  </option>

                  <option value="ISLAMIC_FINANCE">
                    Finance islamique
                  </option>

                  <option value="STARTUP_FUNDING">
                    Financement Startup
                  </option>
                </Select>

                <Input
                  label="Courte description"
                  placeholder="Une phrase qui résume le programme"
                  value={form.shortDescription}
                  onChange={(e) => update("shortDescription", e.target.value)}
                />

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Description complète
                    </span>
                    <textarea
                      rows={6}
                      className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                      placeholder="Décrivez les objectifs du programme, les avantages, les conditions de participation et toutes les informations utiles."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </label>
                </div>

                <Select
                  label="Secteur d'activité"
                  value={form.sector}
                  onChange={(e) => update("sector", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  <option>Agriculture</option>
                  <option>Artisanat</option>
                  <option>Commerce</option>
                  <option>Éducation</option>
                  <option>Énergie</option>
                  <option>Industrie</option>
                  <option>Numérique</option>
                  <option>Santé</option>
                  <option>Services</option>
                  <option>Tourisme</option>
                </Select>

                <Select
                  label="Zone géographique"
                  value={form.region}
                  onChange={(e) => update("region", e.target.value)}
                >
                  <option>Algérie</option>
                  <option>Toutes les wilayas</option>
                  <option>Nord</option>
                  <option>Hauts Plateaux</option>
                  <option>Sud</option>
                </Select>
              </div>
            </Card>

            {/* Funding details */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <DollarSign size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Financement
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Définissez les montants proposés par votre institution.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Select
                  label="Type de financement"
                  value={form.fundingType}
                  onChange={(e) => update("fundingType", e.target.value)}
                >
                  <option value="">Sélectionner un type</option>
                  <option value="grant">Subvention</option>
                  <option value="loan">Prêt</option>
                  <option value="investment">Investissement</option>
                  <option value="mixed">Financement mixte</option>
                </Select>

                <Select
                  label="Devise"
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                >
                  <option>DZD</option>
                  <option>EUR</option>
                  <option>USD</option>
                </Select>

                <Input
                  type="number"
                  label="Montant minimum"
                  placeholder="100000"
                  value={form.minAmount}
                  onChange={(e) => update("minAmount", e.target.value)}
                />

                <Input
                  type="number"
                  label="Montant maximum"
                  placeholder="1000000"
                  value={form.maxAmount}
                  onChange={(e) => update("maxAmount", e.target.value)}
                />
              </div>
            </Card>

            {/* Calendar */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Calendar size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Calendrier
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Définissez la période pendant laquelle les candidatures
                    seront acceptées.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  type="date"
                  label="Ouverture des candidatures"
                  value={form.openingDate}
                  onChange={(e) => update("openingDate", e.target.value)}
                />

                <Input
                  type="date"
                  label="Date limite"
                  value={form.closingDate}
                  onChange={(e) => update("closingDate", e.target.value)}
                />
              </div>
            </Card>

            {/* Eligibility */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Users size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Conditions d'éligibilité
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Décrivez les critères et le public visé par ce programme.
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Public cible
                  </span>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                    placeholder="Exemple : Femmes entrepreneures, startups innovantes, PME..."
                    value={form.targetAudience}
                    onChange={(e) => update("targetAudience", e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Critères d'éligibilité
                  </span>
                  <textarea
                    rows={6}
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                    placeholder={
                      "• Être une entreprise enregistrée\n• Activité depuis au moins 6 mois\n• Projet innovant\n• Résider en Algérie"
                    }
                    value={form.eligibilityCriteria}
                    onChange={(e) =>
                      update("eligibilityCriteria", e.target.value)
                    }
                  />
                </label>
              </div>
            </Card>

            {/* Required documents */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Documents requis
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Ajoutez les documents nécessaires pour la candidature.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {form.documents.map((document, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-sand-200 bg-sand-50 p-4"
                  >
                    <FileText size={18} className="text-ink-soft" />

                    <input
                      type="text"
                      value={document}
                      onChange={(e) => updateDocument(index, e.target.value)}
                      placeholder={`Document ${index + 1}`}
                      className="flex-1 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-rose-400"
                    />

                    {form.documents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDocument}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-rose-300 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Plus size={16} />
                  Ajouter un document
                </button>
              </div>
            </Card>

            {/* Contact */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  <Mail size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Coordonnées de contact
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Les entrepreneures utiliseront ces informations pour vous
                    contacter.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Site web"
                  placeholder="https://..."
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />

                <Input
                  type="email"
                  label="Adresse e-mail"
                  placeholder="contact@institution.dz"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />

                <Input
                  label="Téléphone"
                  placeholder="+213 ..."
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />

                <Select
                  label="Statut"
                  value={form.status}
                  onChange={(e) =>
                    update("status", e.target.value as "draft" | "published")
                  }
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </Select>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enregistrer comme brouillon
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {mode === "create"
  ? "Publication..."
  : "Enregistrement..."}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {mode === "create"
  ? "Publier le programme"
  : "Enregistrer les modifications"}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview */}
          <aside className="sticky top-6 h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="font-bold text-ink">Aperçu</h3>
                <p className="text-sm text-ink-soft">Vue publique du programme</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-ink">
                  {form.title || "Titre du programme"}
                </h4>
                <p className="mt-1 text-sm text-ink-soft">
                  {form.category || "Catégorie"}
                </p>
              </div>

<div className="rounded-xl bg-sand-50 p-4">
  {form.shortDescription && (
    <p className="mb-2 font-semibold text-ink">
      {form.shortDescription}
    </p>
  )}

  <p className="line-clamp-4 text-sm text-ink-soft">
    {form.description ||
      "La description du programme apparaîtra ici..."}
  </p>
</div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Montant</span>
                  <span className="font-semibold text-ink">
                    {form.minAmount || form.maxAmount
                      ? `${form.minAmount || "0"} - ${form.maxAmount || "?"} ${form.currency}`
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Type</span>
                  <span className="font-semibold text-ink">
                    {form.fundingType || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Documents</span>
                  <span className="font-semibold text-ink">
                    {form.documents.filter(Boolean).length}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <CalendarDays size={16} />
                  Période
                </div>
                <p className="mt-2 text-sm text-rose-900">
                  {form.openingDate || "Date début"} {" → "}
                  {form.closingDate || "Date fin"}
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