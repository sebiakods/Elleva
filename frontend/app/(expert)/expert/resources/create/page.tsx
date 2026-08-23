"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

const API_URL = "/api";

export default function CreateResourcePage() {
  const router = useRouter();
  const params = useParams();

  const courseId = params?.id as string | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goBack = () => {
    router.push(
      courseId
        ? `/expert/courses/${encodeURIComponent(courseId)}`
        : "/expert/courses"
    );
  };

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

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("type", type);
      formData.append("category", category.trim());
      formData.append("isPublished", "true");
      formData.append("file", file);

      /*
       * IMPORTANT:
       * No localStorage.
       * No accessToken.
       * No Authorization header.
       *
       * The browser sends the httpOnly authentication
       * cookie automatically because of credentials: "include".
       */
      const response = await fetch(
        `${API_URL}/courses/${encodeURIComponent(courseId)}/resources`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        alert(
          data?.message ||
            "Vous n'avez pas l'autorisation de créer une ressource pour ce cours."
        );
        return;
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

      router.push(
        `/expert/courses/${encodeURIComponent(courseId)}`
      );
    } catch (error) {
      console.error("Erreur création ressource:", error);

      if (error instanceof TypeError) {
        alert(
          "Impossible de contacter le serveur. Vérifiez que le backend est disponible."
        );
      } else {
        alert(
          "Une erreur est survenue lors de la création de la ressource."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Ajouter une ressource" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* TOP ACTIONS */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={goBack}
            {...({ disabled: isSubmitting } as any)}
          >
            <ArrowLeft size={16} />
            Retour
          </Button>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              {...({ disabled: isSubmitting } as any)}
            >
              <Save size={16} />
              Brouillon
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              {...({ disabled: isSubmitting } as any)}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}

              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>

        {/* FORM */}
        <div className="space-y-6">
          {/* INFORMATIONS GÉNÉRALES */}
          <section className="card-surface p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Informations générales
            </h2>

            <div className="space-y-5">
              {/* TITLE */}
              <div>
                <label
                  htmlFor="resource-title"
                  className="mb-2 block text-sm font-medium"
                >
                  Nom de la ressource
                </label>

                <input
                  id="resource-title"
                  type="text"
                  className="w-full rounded-xl border p-3 outline-none transition focus:border-wine-500 focus:ring-2 focus:ring-wine-100"
                  placeholder="Ex : Template Business Plan complet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="resource-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="resource-description"
                  rows={5}
                  className="w-full rounded-xl border p-3 outline-none transition focus:border-wine-500 focus:ring-2 focus:ring-wine-100"
                  placeholder="Décrivez cette ressource..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="resource-category"
                  className="mb-2 block text-sm font-medium"
                >
                  Catégorie
                </label>

                <select
                  id="resource-category"
                  className="w-full rounded-xl border p-3 outline-none transition focus:border-wine-500 focus:ring-2 focus:ring-wine-100"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner</option>
                  <option value="Finance">Finance</option>
                  <option value="Business Plan">
                    Business Plan
                  </option>
                  <option value="Entrepreneuriat">
                    Entrepreneuriat
                  </option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>
          </section>

          {/* TYPE */}
          <section className="card-surface p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Type de ressource
            </h2>

            <label
              htmlFor="resource-type"
              className="sr-only"
            >
              Type de ressource
            </label>

            <select
              id="resource-type"
              className="w-full rounded-xl border p-3 outline-none transition focus:border-wine-500 focus:ring-2 focus:ring-wine-100"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="pdf">PDF</option>
              <option value="template">Template</option>
              <option value="spreadsheet">
                Spreadsheet Excel
              </option>
              <option value="presentation">
                Présentation PowerPoint
              </option>
              <option value="other">Autre fichier</option>
            </select>
          </section>

          {/* UPLOAD */}
          <section className="card-surface p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Fichier
            </h2>

            <label
              htmlFor="resource-file"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition hover:bg-slate-50 ${
                isSubmitting
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              <Upload
                size={45}
                className="mb-3 text-rose-500"
              />

              <p className="font-medium">
                Importer une ressource
              </p>

              <p className="mt-2 text-sm text-gray-500">
                PDF • DOCX • XLSX • PPTX • ZIP
              </p>

              <input
                id="resource-file"
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                disabled={isSubmitting}
                onChange={(e) => {
                  const selectedFile =
                    e.target.files?.[0] ?? null;

                  setFile(selectedFile);
                }}
              />
            </label>

            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border bg-slate-50 p-4">
                <FileText size={25} className="shrink-0" />

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} Mo
                  </p>

                  <p className="text-xs text-gray-400">
                    {file.type || "Type inconnu"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* PREVIEW */}
          <section className="card-surface p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Aperçu
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Nom
                </span>

                <span className="max-w-[60%] truncate text-right">
                  {title || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Type
                </span>

                <span className="text-right">
                  {type}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Catégorie
                </span>

                <span className="max-w-[60%] truncate text-right">
                  {category || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Fichier
                </span>

                <span className="max-w-[60%] truncate text-right">
                  {file ? file.name : "Aucun"}
                </span>
              </div>
            </div>
          </section>

          {/* BOTTOM ACTIONS */}
          <div className="flex flex-col justify-end gap-3 pb-10 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              {...({ disabled: isSubmitting } as any)}
            >
              Annuler
            </Button>

            <Button
              type="button"
              variant="secondary"
              {...({ disabled: isSubmitting } as any)}
            >
              <Save size={16} />
              Enregistrer
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              {...({ disabled: isSubmitting } as any)}
            >
              {isSubmitting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Send size={16} />
              )}

              {isSubmitting
                ? "Publication..."
                : "Publier la ressource"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}