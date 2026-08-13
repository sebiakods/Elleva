"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  FileText,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

export default function CreateResourcePage() {
  const router = useRouter();
  const params = useParams();

  const courseId = params?.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!courseId) {
      alert("Impossible de déterminer le cours.");
      return;
    }

    if (!title.trim()) {
      alert("Le nom de la ressource est obligatoire.");
      return;
    }

    if (!type.trim()) {
      alert("Le type de ressource est obligatoire.");
      return;
    }

    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Vous devez être connecté.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("type", type);
      formData.append("category", category.trim());
      formData.append("isPublished", "true");
      formData.append("file", file);

      const API =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:4000/api";

      const response = await fetch(
        `${API}/courses/${courseId}/resources`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        console.error("Erreur création ressource:", data);
        alert(
          data?.message ||
            data?.error ||
            `Impossible de créer la ressource. (${response.status})`
        );
        return;
      }

      alert("Ressource créée avec succès !");
      router.push(`/expert/courses/${courseId}`);
    } catch (error) {
      console.error("Erreur création ressource:", error);
      alert(
        "Une erreur est survenue lors de la création de la ressource."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Ajouter une ressource" />

      {/* TOP ACTIONS */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() =>
            router.push(
              courseId
                ? `/expert/courses/${courseId}`
                : "/expert/courses"
            )
          }
          {...({ disabled: isSubmitting } as any)}
        >
          <ArrowLeft size={16} />
          Retour
        </Button>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            {...({ disabled: isSubmitting } as any)}
          >
            <Save size={16} />
            Brouillon
          </Button>

          <Button
            onClick={handleSubmit}
            {...({ disabled: isSubmitting } as any)}
          >
            <Send size={16} />
            {isSubmitting ? "Publication..." : "Publier"}
          </Button>
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-6">

        {/* INFORMATIONS GÉNÉRALES */}
        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Informations générales
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nom de la ressource
              </label>

              <input
                className="w-full rounded-xl border p-3"
                placeholder="Ex : Template Business Plan complet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={5}
                className="w-full rounded-xl border p-3"
                placeholder="Décrivez cette ressource..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Catégorie
              </label>

              <select
                className="w-full rounded-xl border p-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Sélectionner</option>
                <option value="Finance">Finance</option>
                <option value="Business Plan">Business Plan</option>
                <option value="Entrepreneuriat">Entrepreneuriat</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>

        {/* TYPE */}
        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Type de ressource
          </h2>

          <select
            className="w-full rounded-xl border p-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="pdf">PDF</option>
            <option value="template">Template</option>
            <option value="spreadsheet">Spreadsheet Excel</option>
            <option value="presentation">Présentation PowerPoint</option>
            <option value="other">Autre fichier</option>
          </select>
        </div>

        {/* UPLOAD */}
        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">Fichier</h2>

          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 hover:bg-slate-50 ${
              isSubmitting ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Upload size={45} className="mb-3 text-rose-500" />

            <p className="font-medium">Importer une ressource</p>

            <p className="mt-2 text-sm text-gray-500">
              PDF • DOCX • XLSX • PPTX • ZIP
            </p>

            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
              disabled={isSubmitting}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                }
              }}
            />
          </label>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border bg-slate-50 p-4">
              <FileText size={25} />

              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>

                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} Mo
                </p>

                <p className="text-xs text-gray-400">
                  {file.type || "Type inconnu"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PREVIEW */}
        <div className="card-surface p-6">
          <h2 className="mb-5 text-lg font-semibold">Aperçu</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Nom</span>
              <span className="text-right">{title || "-"}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Type</span>
              <span className="text-right">{type}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Catégorie</span>
              <span className="text-right">{category || "-"}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Fichier</span>
              <span className="max-w-[60%] truncate text-right">
                {file ? file.name : "Aucun"}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex justify-end gap-4 pb-10">
          <Button
            variant="secondary"
            onClick={() =>
              router.push(
                courseId
                  ? `/expert/courses/${courseId}`
                  : "/expert/courses"
              )
            }
            {...({ disabled: isSubmitting } as any)}
          >
            Annuler
          </Button>

          <Button
            variant="secondary"
            {...({ disabled: isSubmitting } as any)}
          >
            <Save size={16} />
            Enregistrer
          </Button>

          <Button
            onClick={handleSubmit}
            {...({ disabled: isSubmitting } as any)}
          >
            <Send size={16} />
            {isSubmitting
              ? "Publication..."
              : "Publier la ressource"}
          </Button>
        </div>
      </div>
    </>
  );
}