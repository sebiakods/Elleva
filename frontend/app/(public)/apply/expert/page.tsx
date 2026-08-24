"use client";

import { useState } from "react";
import Link from "next/link";

import { GraduationCap, Upload, FileText } from "lucide-react";

import { AuthShell } from "@/components/forms/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { API_BASE_URL as API_URL } from "@/services/api";

interface ExpertForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  title: string;
  experience: string;
  specialties: string;
  languages: string;
  linkedin: string;
  portfolio: string;
  certifications: string;
  motivation: string;
}

const initialForm: ExpertForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  title: "",
  experience: "",
  specialties: "",
  languages: "",
  linkedin: "",
  portfolio: "",
  certifications: "",
  motivation: "",
};
export default function ExpertApplicationPage() {
  const [form, setForm] = useState<ExpertForm>(initialForm);

  const [cvFile, setCvFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange =
    (field: keyof ExpertForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };


  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    setError("");

    if (!file) {
      setCvFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Le CV doit être au format PDF.");
      setCvFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La taille maximale du CV est de 5 MB.");
      setCvFile(null);
      return;
    }

    setCvFile(file);
  };


  const validate = () => {
    if (!form.fullName.trim())
      return "Veuillez saisir votre nom complet.";

    if (!form.email.trim())
      return "Veuillez saisir votre email.";

    if (!form.password.trim()) {
       return "Veuillez saisir un mot de passe.";
    }

    if (form.password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (form.password !== form.confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }
     

    if (!form.title.trim())
      return "Veuillez saisir votre titre professionnel.";

    if (!form.experience.trim())
      return "Veuillez indiquer votre expérience.";

    if (!form.specialties.trim())
      return "Veuillez renseigner vos domaines d'expertise.";

    if (!form.motivation.trim())
      return "Veuillez écrire votre motivation.";

    return "";
  };


  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

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


      Object.entries(form).forEach(([key, value]) => {
        if (key !== "confirmPassword") {
          formData.append(key, value);
        }
      });


      if (cvFile) {
        formData.append("cv", cvFile);
      }


      const response = await fetch(
        `${API_URL}/applications/expert`,
        {
          method: "POST",
          body: formData,
        }
      );


      const data = await response
        .json()
        .catch(() => null);


      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Impossible d'envoyer votre candidature."
        );
      }


      setSuccess(
        "Votre candidature a été envoyée avec succès. Votre compte Expert a été créé et sera activé après validation de notre équipe."
      );


      setForm(initialForm);
      setCvFile(null);


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <AuthShell
      title="Devenir Experte"
      subtitle="Rejoignez notre réseau de mentores et accompagnez les femmes entrepreneures."
    >

      <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-full bg-white p-3">
            <GraduationCap
              size={28}
              className="text-rose-600"
            />
          </div>


          <div>

            <h2 className="font-semibold text-ink">
              Candidature Experte
            </h2>


            <p className="text-sm text-ink-soft">
              Toutes les candidatures sont vérifiées avant
              activation du compte Expert.
            </p>

          </div>

        </div>

      </div>



      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <Input
          label="Nom complet"
          placeholder="Votre nom complet"
          value={form.fullName}
          onChange={handleChange("fullName")}
          required
        />


        <Input
          label="Email professionnel"
          type="email"
          placeholder="vous@email.com"
          value={form.email}
          onChange={handleChange("email")}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="********"
          value={form.password}
          onChange={handleChange("password")}
          required
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="********"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          required
        />


        <Input
          label="Titre professionnel"
          placeholder="Ex : Coach Business, Experte Marketing..."
          value={form.title}
          onChange={handleChange("title")}
          required
        />


        <Input
          label="Années d'expérience"
          placeholder="Ex : 8 ans"
          value={form.experience}
          onChange={handleChange("experience")}
          required
        />


        <Input
          label="Domaines d'expertise"
          placeholder="Marketing, Finance, IA..."
          value={form.specialties}
          onChange={handleChange("specialties")}
          required
        />


        <Input
          label="Langues parlées"
          placeholder="Français, Arabe, Anglais..."
          value={form.languages}
          onChange={handleChange("languages")}
        />


        <Input
          label="Profil LinkedIn"
          placeholder="https://linkedin.com/in/..."
          value={form.linkedin}
          onChange={handleChange("linkedin")}
        />


        <Input
          label="Portfolio / Site web"
          placeholder="https://..."
          value={form.portfolio}
          onChange={handleChange("portfolio")}
        />


        <Input
          label="Certifications"
          placeholder="Ex : Google, Microsoft, AWS..."
          value={form.certifications}
          onChange={handleChange("certifications")}
        />



        <div className="space-y-2">

          <label className="text-sm font-semibold text-ink">
            Pourquoi souhaitez-vous rejoindre Ellevadz ?
          </label>


          <textarea
            rows={6}
            value={form.motivation}
            onChange={handleChange("motivation")}
            placeholder="Présentez votre parcours et votre motivation..."
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />

        </div>




        <div className="space-y-2">

          <label className="text-sm font-semibold text-ink">
            CV (PDF)
          </label>


          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 px-6 py-10 hover:border-rose-400 hover:bg-rose-50">

            <Upload
              size={42}
              className="mb-3 text-rose-500"
            />


            <p className="font-semibold text-ink">
              Cliquez pour sélectionner votre CV
            </p>


            <p className="mt-1 text-sm text-ink-soft">
              PDF uniquement • Maximum 5 MB
            </p>


            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

          </label>



          {cvFile && (

            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">

              <FileText size={18} />

              {cvFile.name}

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



      <Button
        type="submit"
        size="lg"
        className={`w-full ${
          loading ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        {loading
          ? "Envoi..."
          : "Soumettre ma candidature"}
      </Button>



        <div className="rounded-xl border border-sand-200 bg-sand-50 p-5">

          <h3 className="mb-2 font-semibold text-ink">
            Processus de validation
          </h3>


          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">

            <li>
              Soumission de votre candidature.
            </li>

            <li>
              Vérification de votre profil.
            </li>

            <li>
              Validation par notre équipe.
            </li>

            <li>
              Activation du compte Experte.
            </li>

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
