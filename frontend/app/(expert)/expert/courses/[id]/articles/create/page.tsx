"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Course = {
  id: string;
  title: string;
};

export default function CreateArticlePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);

  // PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`${API_URL}/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            json.message || "Impossible de charger le cours."
          );
        }

        setCourse(json.data);
      } catch (error) {
        console.error(error);

        alert(
          error instanceof Error
            ? error.message
            : "Impossible de charger le cours."
        );
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  function handlePdfChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Veuillez sélectionner uniquement un fichier PDF.");
      e.target.value = "";
      return;
    }

    // 100 MB
    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Le fichier PDF ne doit pas dépasser 100 MB.");
      e.target.value = "";
      return;
    }

    setPdfFile(file);
  }

  function removePdf() {
    setPdfFile(null);

    const input = document.getElementById(
      "pdfFile"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function createArticle(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Veuillez renseigner le titre de l'article.");
      return;
    }

    if (!content.trim()) {
      alert("Veuillez renseigner le contenu de l'article.");
      return;
    }

    if (!category.trim()) {
      alert("Veuillez renseigner la catégorie.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("accessToken");

      /*
       * IMPORTANT:
       * We use FormData because we are sending
       * both normal fields AND a real PDF file.
       */
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("excerpt", excerpt.trim());
      formData.append("content", content.trim());
      formData.append("category", category.trim());
      formData.append(
        "readTimeMinutes",
        String(Number(readTimeMinutes))
      );

      if (pdfFile) {        
        formData.append("files", pdfFile);
      }

      const res = await fetch(
        `${API_URL}/courses/${courseId}/articles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          /*
           * DO NOT set Content-Type here.
           *
           * The browser automatically creates:
           * multipart/form-data; boundary=...
           */
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.message || "Impossible de créer l'article."
        );
      }

      router.push(
        `/expert/courses/${courseId}/articles`
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Créer un article" />

        <main className="p-6">
          <div className="card-surface p-10 text-center text-sm text-gray-500">
            Chargement du cours...
          </div>
        </main>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header title="Créer un article" />

        <main className="p-6">
          <div className="card-surface p-10 text-center">
            <p className="text-sm text-gray-500">
              Cours introuvable.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}/articles`
                )
              }
              className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Retour aux articles
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Créer un article" />

      <main className="p-6">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}/articles`
                )
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-purple-600"
            >
              <ArrowLeft size={16} />
              Retour aux articles
            </button>

            <h1 className="text-2xl font-semibold text-gray-900">
              Créer un article
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Ajouter une nouvelle leçon au cours{" "}
              <span className="font-medium text-gray-700">
                {course.title}
              </span>
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={createArticle}
            className="card-surface space-y-6 p-6"
          >

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-800"
              >
                Titre de l'article
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Ex. Comprendre son marché cible"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label
                htmlFor="excerpt"
                className="text-sm font-medium text-gray-800"
              >
                Résumé
              </label>

              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) =>
                  setExcerpt(e.target.value)
                }
                placeholder="Courte description de cette leçon..."
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Category + Read time */}
            <div className="grid gap-5 md:grid-cols-2">

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-800"
                >
                  Catégorie
                </label>

                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  placeholder="Ex. Business Plan"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="readTime"
                  className="text-sm font-medium text-gray-800"
                >
                  Temps de lecture
                </label>

                <div className="relative">
                  <input
                    id="readTime"
                    type="number"
                    min={1}
                    value={readTimeMinutes}
                    onChange={(e) =>
                      setReadTimeMinutes(
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-24 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-gray-800"
              >
                Contenu
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                placeholder="Rédigez le contenu complet de votre article..."
                rows={16}
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 leading-7 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* PDF Upload */}
            <div className="space-y-3">

              <label className="text-sm font-medium text-gray-800">
                Document PDF
              </label>

              {!pdfFile ? (
                <label
                  htmlFor="pdfFile"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center transition hover:border-purple-300 hover:bg-purple-50"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Upload size={22} />
                  </div>

                  <p className="font-medium text-gray-800">
                    Télécharger un PDF
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Cliquez pour sélectionner votre document
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    PDF uniquement • Maximum 100 MB
                  </p>

                  <input
                    id="pdfFile"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50 p-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {pdfFile.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {(
                          pdfFile.size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removePdf}
                    className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-red-600"
                    title="Supprimer le PDF"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    `/expert/courses/${courseId}/articles`
                  )
                }
              >
                Annuler
              </Button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                {saving
                  ? "Création..."
                  : "Créer l'article"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
