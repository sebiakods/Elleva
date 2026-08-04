"use client";

import { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Video,
  Save,
  Send,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Débutant");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [objectives, setObjectives] = useState("");
  const [requirements, setRequirements] = useState("");

  const [cover, setCover] = useState<File | null>(null);
  const [courseFile, setCourseFile] = useState<File | null>(null);

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Please login first.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("level", level);
    formData.append("durationMinutes", "120");

    if (cover) {
      formData.append("cover", cover);
    }

    if (courseFile) {
      formData.append("courseFile", courseFile);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    alert("Course created!");

    router.push("/expert/courses");
  } catch (err: any) {
    alert(err.message);
  }
};

  return (
    <>
      <Header title="Créer un cours" />

      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => router.push("/expert/courses")}
        >
          <ArrowLeft size={16} />
          Retour
        </Button>

        <div className="flex gap-3">
          <Button variant="secondary">
            <Save size={16} />
            Brouillon
          </Button>

          <Button onClick={handleSubmit}>
            <Send size={16} />
            Publier
          </Button>
        </div>
      </div>

      <div className="space-y-6">

        {/* ================= Général ================= */}

        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Informations générales
          </h2>

          <div className="grid gap-5">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Titre du cours
              </label>

              <input
                className="w-full rounded-xl border p-3"
                placeholder="Ex : Construire un Business Plan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Sous-titre
              </label>

              <input
                className="w-full rounded-xl border p-3"
                placeholder="Une courte présentation"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={6}
                className="w-full rounded-xl border p-3"
                placeholder="Décrivez votre cours..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* ================= Catégorie ================= */}

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Catégorie
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Catégorie
              </label>

              <select
                className="w-full rounded-xl border p-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option>Financement</option>
                <option>Business Plan</option>
                <option>Marketing</option>
                <option>Comptabilité</option>
                <option>Leadership</option>
                <option>Digital</option>
              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Niveau
              </label>

              <select
                className="w-full rounded-xl border p-3"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>

            </div>

          </div>

        </div>

        {/* ================= Couverture ================= */}

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Image de couverture
          </h2>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center hover:bg-slate-50">

            <ImageIcon className="mb-3 text-rose-500" size={40} />

            <p className="font-medium">
              Choisir une image
            </p>

            <p className="text-sm text-gray-500">
              PNG, JPG, WEBP
            </p>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.length) {
                  setCover(e.target.files[0]);
                }
              }}
            />

          </label>

          {cover && (
            <p className="mt-3 text-sm text-green-600">
              ✓ {cover.name}
            </p>
          )}

        </div>

        {/* ================= Contenu ================= */}

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Contenu du cours
          </h2>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center hover:bg-slate-50">

            <Upload className="mb-3 text-rose-500" size={45} />

            <p className="font-semibold">
              Déposer un fichier
            </p>

            <p className="mt-2 text-sm text-gray-500">
              PDF • MP4 • PPT • DOCX • XLSX • ZIP • MP3 • Images
            </p>

            <input
              type="file"
              accept=".pdf,.mp4,.mov,.webm,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.mp3,.png,.jpg,.jpeg"
              hidden
              onChange={(e) => {
                if (e.target.files?.length) {
                  setCourseFile(e.target.files[0]);
                }
              }}
            />

          </label>

          {courseFile && (
            <div className="mt-4 rounded-xl border bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                {courseFile.type.includes("video") ? (
                  <Video size={22} />
                ) : (
                  <FileText size={22} />
                )}

                <div>
                  <p className="font-medium">
                    {courseFile.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(courseFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                </div>

              </div>

            </div>
          )}

        </div>
        {/* ================= Tarification ================= */}

        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Tarification
          </h2>

          <div className="flex items-center gap-6 mb-5">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isFree}
                onChange={() => setIsFree(true)}
              />
              Gratuit
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isFree}
                onChange={() => setIsFree(false)}
              />
              Payant
            </label>
          </div>

          {!isFree && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Prix (DA)
              </label>

              <input
                type="number"
                className="w-full rounded-xl border p-3"
                placeholder="5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ================= Objectifs ================= */}

        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Objectifs d'apprentissage
          </h2>

          <textarea
            rows={5}
            className="w-full rounded-xl border p-3"
            placeholder="Exemple :
• Comprendre les bases du financement
• Réaliser un business plan
• Préparer un dossier d'investissement"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
          />
        </div>

        {/* ================= Prérequis ================= */}

        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Prérequis
          </h2>

          <textarea
            rows={4}
            className="w-full rounded-xl border p-3"
            placeholder="Aucun prérequis ou compétences nécessaires..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        {/* ================= Aperçu ================= */}

        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Aperçu
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Titre
              </span>

              <span className="font-medium">
                {title || "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Catégorie
              </span>

              <span className="font-medium">
                {category || "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Niveau
              </span>

              <span className="font-medium">
                {level}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Prix
              </span>

              <span className="font-medium">
                {isFree ? "Gratuit" : `${price || 0} DA`}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Image
              </span>

              <span className="font-medium">
                {cover ? cover.name : "Aucune"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Fichier
              </span>

              <span className="font-medium">
                {courseFile ? courseFile.name : "Aucun"}
              </span>
            </div>

          </div>
        </div>

        {/* ================= Actions ================= */}

        <div className="flex justify-end gap-4 pb-10">

          <Button
            variant="secondary"
            onClick={() => router.push("/expert/courses")}
          >
            Annuler
          </Button>

          <Button variant="secondary">
            <Save size={16} />
            Enregistrer comme brouillon
          </Button>

          <Button onClick={handleSubmit}>
            <Send size={16} />
            Publier le cours
          </Button>

        </div>

      </div>
    </>
  );
}