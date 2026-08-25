"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  DollarSign,
  Eye,
  FileText,
  Landmark,
  Loader2,
  Mail,
  Plus,
  Send,
  Trash2,
  Users,
} from "lucide-react";

import { API_BASE_URL as API_URL } from "@/services/api";

const PROGRAMS_ENDPOINT = `${API_URL}/institution/programs`;
/* -------------------------------------------------------------------------- */
/* UI components                                                              */
/* -------------------------------------------------------------------------- */

function Header({ title }: { title: string }) {
  return (
    <header className="mb-6 border-b border-sand-200 pb-4">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
    </header>
  );
}

function Badge({
  children,
  tone = "red",
}: {
  children: React.ReactNode;
  tone?: "red" | "gray";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        tone === "red"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        variant === "outline"
          ? "border border-sand-300 bg-white text-ink hover:bg-sand-50"
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  hover = false,
}: {
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-sand-200 bg-white p-6 shadow-sm ${
        hover ? "transition hover:shadow-md" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </span>

      <input
        {...props}
        className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      />
    </label>
  );
}

function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </span>

      <select
        {...props}
        className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      >
        {children}
      </select>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FormState {
  title: string;
  category: string;
  shortDescription: string;
  description: string;
  sector: string;
  region: string;
  fundingType: string;
  currency: string;
  minAmount: string;
  maxAmount: string;
  openingDate: string;
  closingDate: string;
  targetAudience: string;
  eligibilityCriteria: string;
  documents: string[];
  website: string;
  email: string;
  phone: string;
  status: "draft" | "published";
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function normalizeAmount(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return amount;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProgramForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const params = useParams();

  const programId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : null;

  const [form, setForm] = useState<FormState>({
    title: "",
    category: "",
    shortDescription: "",
    description: "",
    sector: "",
    region: "Algérie",
    fundingType: "",
    currency: "DZD",
    minAmount: "",
    maxAmount: "",
    openingDate: "",
    closingDate: "",
    targetAudience: "",
    eligibilityCriteria: "",
    documents: [""],
    website: "",
    email: "",
    phone: "",
    status: "draft",
  });

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const update = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateDocument = (index: number, value: string) => {
    setForm((prev) => {
      const documents = [...prev.documents];
      documents[index] = value;

      return {
        ...prev,
        documents,
      };
    });
  };

  const addDocument = () => {
    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, ""],
    }));
  };

  const removeDocument = (index: number) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */
const submit = async (
  e?: React.FormEvent,
  forcedStatus?: "draft" | "published"
) => {
  e?.preventDefault();
  setMessage(null);

  if (mode === "edit" && !programId) {
    setMessage({
      type: "error",
      text: "Identifiant du programme introuvable.",
    });
    return;
  }

  if (!form.title.trim()) {
    setMessage({
      type: "error",
      text: "Veuillez saisir le nom du programme.",
    });
    return;
  }

  if (!form.category) {
    setMessage({
      type: "error",
      text: "Veuillez sélectionner une catégorie.",
    });
    return;
  }

  const minAmount = normalizeAmount(form.minAmount);
  const maxAmount = normalizeAmount(form.maxAmount);

  if (form.minAmount && minAmount === null) {
    setMessage({
      type: "error",
      text: "Le montant minimum est invalide.",
    });
    return;
  }

  if (form.maxAmount && maxAmount === null) {
    setMessage({
      type: "error",
      text: "Le montant maximum est invalide.",
    });
    return;
  }

  if (
    minAmount !== null &&
    maxAmount !== null &&
    minAmount > maxAmount
  ) {
    setMessage({
      type: "error",
      text: "Le montant minimum ne peut pas être supérieur au montant maximum.",
    });
    return;
  }

  if (
    form.openingDate &&
    form.closingDate &&
    form.openingDate > form.closingDate
  ) {
    setMessage({
      type: "error",
      text: "La date d'ouverture doit être antérieure à la date limite.",
    });
    return;
  }

  const finalStatus = forcedStatus ?? form.status;

  const payload = {
    title: form.title.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    category: form.category,
    sector: form.sector || null,
    fundingType: form.fundingType || null,
    amountMin: minAmount,
    amountMax: maxAmount,
    currency: form.currency,
    openingDate: form.openingDate || null,
    closingDate: form.closingDate || null,
    region: form.region || null,
    targetAudience: form.targetAudience.trim(),

    eligibilityCriteria: form.eligibilityCriteria
      .split("\n")
      .map((item) =>
        item.replace(/^[•\-*]\s*/, "").trim()
      )
      .filter(Boolean),

    requiredDocuments: form.documents
      .map((document) => document.trim())
      .filter(Boolean),

    website: form.website.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,

    isPublished: finalStatus === "published",
  };

  setSaving(true);

  try {
    const url =
      mode === "create"
        ? PROGRAMS_ENDPOINT
        : `${PROGRAMS_ENDPOINT}/${encodeURIComponent(programId!)}`;

    const response = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",

      headers: {
        "Content-Type": "application/json",
      },


      credentials: "include",

      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) {
        setMessage({
          type: "error",
          text: "Votre session a expiré. Veuillez vous reconnecter.",
        });

        return;
      }

      if (response.status === 403) {
        setMessage({
          type: "error",
          text: "Vous n'avez pas l'autorisation d'effectuer cette action.",
        });

        return;
      }

      throw new Error(
        data?.message ||
          data?.error ||
          `Erreur ${response.status}: impossible d'enregistrer le programme.`
      );
    }

    setMessage({
      type: "success",
      text:
        mode === "create"
          ? finalStatus === "published"
            ? "Programme publié avec succès."
            : "Brouillon enregistré avec succès."
          : "Programme modifié avec succès.",
    });

    setTimeout(() => {
      router.push("/institution/programs");
      router.refresh();
    }, 500);
  } catch (error) {
    console.error("PROGRAM SAVE ERROR:", error);

    if (error instanceof TypeError) {
      setMessage({
        type: "error",
        text:
          "Impossible de contacter le serveur. Vérifiez votre connexion.",
      });
    } else {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'enregistrement.",
      });
    }
  } finally {
    setSaving(false);
  }
};
  const saveDraft = () => {
    submit(undefined, "draft");
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

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
        {/* Page heading */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="red">
                {mode === "create"
                  ? "Nouveau programme"
                  : "Modification"}
              </Badge>

              <Badge tone="red">Institution</Badge>
            </div>

            <h1 className="font-display text-4xl text-ink">
              {mode === "create"
                ? "Créer un programme de financement"
                : "Modifier le programme"}
            </h1>

            <p className="mt-3 max-w-3xl text-ink-soft">
              D&apos;finissez les informations de votre programme, les montants,
              les critères d&apos;éligibilité, les dates importantes ainsi que les
              coordonnées de contact avant la publication.
            </p>
          </div>

          <Link href="/institution/programs">
            <Button type="button" variant="outline">
              <ArrowLeft size={18} />
              Retour
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form className="space-y-8" onSubmit={(e) => submit(e)}>
            {/* ---------------------------------------------------------------- */}
            {/* General information                                              */}
            {/* ---------------------------------------------------------------- */}

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
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
                  required
                  label="Nom du programme"
                  placeholder="Programme Innovation Femmes 2026"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />

                <Select
                  required
                  label="Catégorie"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  <option value="GOVERNMENT_GRANT">Subvention</option>
                  <option value="BANK_LOAN">Prêt bancaire</option>
                  <option value="ISLAMIC_FINANCE">Finance islamique</option>
                  <option value="STARTUP_FUNDING">
                    Financement Startup
                  </option>
                </Select>

                <Input
                  label="Courte description"
                  placeholder="Une phrase qui résume le programme"
                  value={form.shortDescription}
                  onChange={(e) =>
                    update("shortDescription", e.target.value)
                  }
                />

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Description complète
                    </span>

                    <textarea
                      rows={6}
                      className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="Décrivez les objectifs du programme, les avantages, les conditions de participation et toutes les informations utiles."
                      value={form.description}
                      onChange={(e) =>
                        update("description", e.target.value)
                      }
                    />
                  </label>
                </div>

                <Select
                  label="Secteur d'activité"
                  value={form.sector}
                  onChange={(e) => update("sector", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Artisanat">Artisanat</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Éducation">Éducation</option>
                  <option value="Énergie">Énergie</option>
                  <option value="Industrie">Industrie</option>
                  <option value="Numérique">Numérique</option>
                  <option value="Santé">Santé</option>
                  <option value="Services">Services</option>
                  <option value="Tourisme">Tourisme</option>
                </Select>

                <Select
                  label="Zone géographique"
                  value={form.region}
                  onChange={(e) => update("region", e.target.value)}
                >
                  <option value="Algérie">Algérie</option>
                  <option value="Toutes les wilayas">
                    Toutes les wilayas
                  </option>
                  <option value="Nord">Nord</option>
                  <option value="Hauts Plateaux">
                    Hauts Plateaux
                  </option>
                  <option value="Sud">Sud</option>
                </Select>
              </div>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* Funding                                                           */}
            {/* ---------------------------------------------------------------- */}

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
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
                  onChange={(e) =>
                    update("fundingType", e.target.value)
                  }
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
                  <option value="DZD">DZD</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </Select>

                <Input
                  type="number"
                  min="0"
                  label="Montant minimum"
                  placeholder="100000"
                  value={form.minAmount}
                  onChange={(e) =>
                    update("minAmount", e.target.value)
                  }
                />

                <Input
                  type="number"
                  min="0"
                  label="Montant maximum"
                  placeholder="1000000"
                  value={form.maxAmount}
                  onChange={(e) =>
                    update("maxAmount", e.target.value)
                  }
                />
              </div>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* Calendar                                                          */}
            {/* ---------------------------------------------------------------- */}

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
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
                  onChange={(e) =>
                    update("openingDate", e.target.value)
                  }
                />

                <Input
                  type="date"
                  label="Date limite"
                  value={form.closingDate}
                  onChange={(e) =>
                    update("closingDate", e.target.value)
                  }
                />
              </div>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* Eligibility                                                       */}
            {/* ---------------------------------------------------------------- */}

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Users size={22} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Conditions d&apos;éligibilité
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
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Exemple : Femmes entrepreneures, startups innovantes, PME..."
                    value={form.targetAudience}
                    onChange={(e) =>
                      update("targetAudience", e.target.value)
                    }
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                    Critères d&apos;éligibilité
                  </span>

                  <textarea
                    rows={6}
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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

            {/* ---------------------------------------------------------------- */}
            {/* Documents                                                         */}
            {/* ---------------------------------------------------------------- */}

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
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
                    <FileText
                      size={18}
                      className="shrink-0 text-ink-soft"
                    />

                    <input
                      type="text"
                      value={document}
                      onChange={(e) =>
                        updateDocument(index, e.target.value)
                      }
                      placeholder={`Document ${index + 1}`}
                      className="flex-1 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-red-500"
                    />

                    {form.documents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDocument}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Plus size={16} />
                  Ajouter un document
                </button>
              </div>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* Contact                                                           */}
            {/* ---------------------------------------------------------------- */}

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
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
                  type="url"
                  label="Site web"
                  placeholder="https://..."
                  value={form.website}
                  onChange={(e) =>
                    update("website", e.target.value)
                  }
                />

                <Input
                  type="email"
                  label="Adresse e-mail"
                  placeholder="contact@institution.dz"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />

                <Input
                  type="tel"
                  label="Téléphone"
                  placeholder="+213 ..."
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />

                <Select
                  label="Statut"
                  value={form.status}
                  onChange={(e) =>
                    update(
                      "status",
                      e.target.value as "draft" | "published"
                    )
                  }
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </Select>
              </div>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* Actions                                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={17} className="animate-spin" />
                    Enregistrement...
                  </span>
                ) : (
                  "Enregistrer comme brouillon"
                )}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                      ? form.status === "published"
                        ? "Publier le programme"
                        : "Créer le brouillon"
                      : "Enregistrer les modifications"}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ------------------------------------------------------------------ */}
          {/* Preview                                                             */}
          {/* ------------------------------------------------------------------ */}

          <aside className="sticky top-6 h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Eye size={18} />
              </div>

              <div>
                <h3 className="font-bold text-ink">Aperçu</h3>
                <p className="text-sm text-ink-soft">
                  Vue publique du programme
                </p>
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
                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-soft">Montant</span>

                  <span className="text-right font-semibold text-ink">
                    {form.minAmount || form.maxAmount
                      ? `${form.minAmount || "0"} - ${
                          form.maxAmount || "?"
                        } ${form.currency}`
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-soft">Type</span>

                  <span className="text-right font-semibold text-ink">
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

              <div className="rounded-xl bg-red-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                  <CalendarDays size={16} />
                  Période
                </div>

                <p className="mt-2 text-sm text-red-900">
                  {form.openingDate || "Date début"} {" → "}
                  {form.closingDate || "Date fin"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Message                                                               */}
      {/* -------------------------------------------------------------------- */}

      {message && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-4 text-sm font-semibold shadow-lg ${
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
