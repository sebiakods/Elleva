"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Building2, Upload, FileText } from "lucide-react";

import { AuthShell } from "@/components/forms/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa",
  "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa",
  "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel",
  "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès",
  "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma",
  "Aïn Témouchent", "Ghardaïa", "Relizane",
];

interface InstitutionForm {
  organizationName: string;
  organizationType: string;
  wilaya: string;
  contactName: string;
  contactRole: string;
  email: string;
  password: string;
  phone: string;
  website: string;
  sectors: string;
  motivation: string;
}

export default function InstitutionApplicationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [form, setForm] = useState<InstitutionForm>({
    organizationName: "",
    organizationType: "",
    wilaya: "",
    contactName: "",
    contactRole: "",
    email: "",
    password: "",
    phone: "",
    website: "",
    sectors: "",
    motivation: "",
  });

  const handleChange =
    (field: keyof InstitutionForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const validate = () => {
    if (!form.organizationName.trim())
      return "Veuillez saisir le nom de l'institution.";
    if (!form.organizationType.trim())
      return "Veuillez indiquer le type d'institution.";
    if (!form.wilaya.trim()) return "Veuillez sélectionner votre wilaya.";
    if (!form.contactName.trim())
      return "Veuillez saisir le nom du contact.";
    if (!form.email.trim()) return "Veuillez saisir votre email.";
    if (!form.motivation.trim())
      return "Veuillez décrire votre motivation.";

    return "";
  };

const API_URL = '/api';

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  const validation = validate();

  if (validation) {
    setError(validation);
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();

    formData.append("organizationName", form.organizationName);
    formData.append("organizationType", form.organizationType);
    formData.append("wilaya", form.wilaya);
    formData.append("contactName", form.contactName);
    formData.append("contactRole", form.contactRole);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("phone", form.phone);
    formData.append("website", form.website);
    formData.append("sectors", form.sectors);
    formData.append("motivation", form.motivation);

    if (documentFile) {
      formData.append("document", documentFile);
    }

    const response = await fetch(
      `${API_URL}/api/institution-applications`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Impossible d'envoyer la candidature."
      );
    }

    setSuccess(
      "Votre candidature a été envoyée avec succès. Votre compte sera activé après validation par notre équipe."
    );

    setForm({
      organizationName: "",
      organizationType: "",
      wilaya: "",
      contactName: "",
      contactRole: "",
      email: "",
      password: "",
      phone: "",
      website: "",
      sectors: "",
      motivation: "",
    });

    setDocumentFile(null);

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Impossible d'envoyer la candidature."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <AuthShell
      title="Devenir Institution Partenaire"
      subtitle="Rejoignez notre réseau et accompagnez les femmes entrepreneures de votre région."
    >
      <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white p-3">
            <Building2 size={28} className="text-rose-600" />
          </div>

          <div>
            <h2 className="font-semibold text-ink">
              Candidature Institution
            </h2>

            <p className="text-sm text-ink-soft">
              Toutes les candidatures sont vérifiées avant l'activation du
              compte Institution.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nom de l'institution"
          placeholder="Ex : Chambre de Commerce de Sétif"
          value={form.organizationName}
          onChange={handleChange("organizationName")}
          required
        />

        <Input
          label="Type d'institution"
          placeholder="Ex : Incubateur, ANSEJ, Chambre de commerce..."
          value={form.organizationType}
          onChange={handleChange("organizationType")}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">Wilaya</label>

          <select
            value={form.wilaya}
            onChange={handleChange("wilaya")}
            required
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Sélectionnez votre wilaya</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Nom du contact"
          placeholder="Nom et prénom"
          value={form.contactName}
          onChange={handleChange("contactName")}
          required
        />

        <Input
          label="Fonction du contact"
          placeholder="Ex : Directrice, Responsable partenariats..."
          value={form.contactRole}
          onChange={handleChange("contactRole")}
        />

        <Input
          label="Email professionnel"
          type="email"
          placeholder="contact@institution.dz"
          value={form.email}
          onChange={handleChange("email")}
          required
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Minimum 8 caractères"
          value={form.password}
          onChange={handleChange("password")}
          required
        />

        <Input
          label="Téléphone"
          placeholder="+213 ..."
          value={form.phone}
          onChange={handleChange("phone")}
        />

        <Input
          label="Site web"
          placeholder="https://..."
          value={form.website}
          onChange={handleChange("website")}
        />

        <Input
          label="Secteurs d'accompagnement"
          placeholder="Ex : Financement, Formation, Mentorat..."
          value={form.sectors}
          onChange={handleChange("sectors")}
        />

        {/* Motivation */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Pourquoi souhaitez-vous rejoindre Ellevadz ?
          </label>

          <textarea
            rows={6}
            value={form.motivation}
            onChange={handleChange("motivation")}
            placeholder="Présentez votre institution et expliquez comment vous souhaitez accompagner les femmes entrepreneures..."
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
        </div>

        {/* Supporting document upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Document justificatif (agrément, statuts...)
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 px-6 py-10 transition hover:border-rose-400 hover:bg-rose-50">
            <Upload size={42} className="mb-3 text-rose-500" />

            <p className="font-semibold text-ink">
              Cliquez pour sélectionner un document
            </p>

            <p className="mt-1 text-sm text-ink-soft">
              PDF • Taille maximale 5 MB
            </p>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) =>
                setDocumentFile(e.target.files?.[0] ?? null)
              }
            />
          </label>

          {documentFile && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <FileText size={18} />
              {documentFile.name}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full">
          {loading ? "Envoi de la candidature..." : "Soumettre ma candidature"}
        </Button>

        <div className="rounded-xl border border-sand-200 bg-sand-50 p-5">
          <h3 className="mb-2 font-semibold text-ink">
            Processus de validation
          </h3>

          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">
            <li>Soumission de votre candidature.</li>
            <li>Vérification de votre institution par notre équipe.</li>
            <li>
              Validation ou demande d'informations complémentaires.
            </li>
            <li>Activation de votre compte Institution.</li>
          </ol>
        </div>

        <div className="text-center text-sm text-ink-soft">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-semibold text-rose-600 hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
