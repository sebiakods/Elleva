"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

type Article = {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  pdfUrl?: string | null;
  readTimeMinutes?: number;
  isPublished?: boolean;
};

type Course = {
  id: string;
  title: string;
};

function getFileUrl(url?: string | null): string | null {
  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const articleId = params.articleId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [article, setArticle] = useState<Article | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [isPublished, setIsPublished] = useState(false);

  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (!courseId || !articleId) return;

    loadData();
  }, [courseId, articleId]);

  async function loadData() {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      const [courseRes, articleRes] = await Promise.all([
        fetch(`${API_URL}/courses/${courseId}`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/courses/${courseId}/articles/${articleId}`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const courseJson = await courseRes.json();
      const articleJson = await articleRes.json();

      if (!courseRes.ok) {
        throw new Error(
          courseJson.message || "Impossible de charger le cours."
        );
      }

      if (!articleRes.ok) {
        throw new Error(
          articleJson.message || "Impossible de charger l'article."
        );
      }

      const courseData = courseJson.data;
      const articleData = articleJson.data;

      if (!courseData) {
        throw new Error("Les données du cours sont introuvables.");
      }

      if (!articleData) {
        throw new Error("Les données de l'article sont introuvables.");
      }

      setCourse(courseData);

      setArticle(articleData);

      setTitle(articleData.title || "");
      setExcerpt(articleData.excerpt || "");
      setContent(articleData.content || "");
      setCategory(articleData.category || "");
      setReadTimeMinutes(articleData.readTimeMinutes || 5);
      setIsPublished(Boolean(articleData.isPublished));
      setExistingPdfUrl(articleData.pdfUrl || null);
    } catch (error) {
      console.error("Error loading article:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de charger l'article."
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePdfChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Veuillez sélectionner uniquement un fichier PDF.");
      e.target.value = "";
      return;
    }

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Le fichier PDF ne doit pas dépasser 20 MB.");
      e.target.value = "";
      return;
    }

    setNewPdfFile(file);
  }

  function removeNewPdf() {
    setNewPdfFile(null);

    const input = document.getElementById(
      "pdf-replace"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
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

    if (!readTimeMinutes || readTimeMinutes < 1) {
      alert("Le temps de lecture doit être supérieur à 0.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
      }

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("excerpt", excerpt.trim());
      formData.append("content", content.trim());
      formData.append("category", category.trim());
      formData.append("readTimeMinutes", String(readTimeMinutes));
      formData.append("isPublished", String(isPublished));

      /*
       * IMPORTANT:
       * The backend article update route uses:
       *
       * upload.array("files", 10)
       *
       * Therefore the field name must be "files".
       */
      if (newPdfFile) {
        formData.append("files", newPdfFile);
      }

      const res = await fetch(
        `${API_URL}/courses/${courseId}/articles/${articleId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.message || "Impossible de mettre à jour l'article."
        );
      }

      alert("Article mis à jour avec succès.");

      router.push(`/expert/courses/${courseId}/articles`);
    } catch (error) {
      console.error("Update article error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cet article ? Cette action est irréversible."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
      }

      const res = await fetch(
        `${API_URL}/courses/${courseId}/articles/${articleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.message || "Impossible de supprimer l'article."
        );
      }

      router.push(`/expert/courses/${courseId}/articles`);
    } catch (error) {
      console.error("Delete article error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[60vh] p-6">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Loader2
              size={20}
              className="animate-spin text-purple-600"
            />
            Chargement de l'article...
          </div>
        </div>
      </main>
    );
  }

  if (!course || !article) {
    return (
      <main className="min-h-[60vh] p-6">
        <div className="mx-auto max-w-4xl py-16 text-center">
          <FileText
            size={42}
            className="mx-auto mb-4 text-gray-300"
          />

          <h1 className="text-2xl font-semibold text-gray-900">
            Article introuvable
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            L'article demandé n'existe pas ou n'est plus disponible.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(`/expert/courses/${courseId}/articles`)
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            <ArrowLeft size={17} />
            Retour aux articles
          </button>
        </div>
      </main>
    );
  }

  const existingPdf = getFileUrl(existingPdfUrl);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(`/expert/courses/${courseId}/articles`)
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-purple-600"
            >
              <ArrowLeft size={16} />
              Retour aux articles
            </button>

            <h1 className="text-2xl font-semibold text-gray-900">
              Modifier l'article
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Cours :{" "}
              <span className="font-medium text-gray-700">
                {course.title}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}

            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSave}
          className="card-surface space-y-6 p-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="article-title"
              className="text-sm font-medium text-gray-800"
            >
              Titre de l'article
            </label>

            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label
              htmlFor="article-excerpt"
              className="text-sm font-medium text-gray-800"
            >
              Résumé
            </label>

            <textarea
              id="article-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Category + Read time */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="article-category"
                className="text-sm font-medium text-gray-800"
              >
                Catégorie
              </label>

              <input
                id="article-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="article-read-time"
                className="text-sm font-medium text-gray-800"
              >
                Temps de lecture
              </label>

              <div className="relative">
                <input
                  id="article-read-time"
                  type="number"
                  min={1}
                  value={readTimeMinutes}
                  onChange={(e) =>
                    setReadTimeMinutes(Number(e.target.value))
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
              htmlFor="article-content"
              className="text-sm font-medium text-gray-800"
            >
              Contenu
            </label>

            <textarea
              id="article-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 leading-7 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Existing PDF */}
          {existingPdf && !newPdfFile && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                PDF actuel
              </label>

              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <FileText size={22} />
                  </div>

                  <p className="truncate text-sm font-medium text-gray-800">
                    Document PDF joint
                  </p>
                </div>

                <a
                  href={existingPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-white"
                >
                  <ExternalLink size={14} />
                  Ouvrir
                </a>
              </div>
            </div>
          )}

          {/* Replace PDF */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800">
              {existingPdf ? "Remplacer le PDF" : "Ajouter un PDF"}
            </label>

            {!newPdfFile ? (
              <label
                htmlFor="pdf-replace"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center transition hover:border-purple-300 hover:bg-purple-50"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Upload size={20} />
                </div>

                <p className="text-sm font-medium text-gray-800">
                  Cliquez pour sélectionner un fichier
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  PDF uniquement · 20 MB maximum
                </p>

                <input
                  id="pdf-replace"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                    <FileText size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {newPdfFile.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {(newPdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeNewPdf}
                  className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-red-500"
                  title="Retirer le nouveau PDF"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Publié
              </p>

              <p className="mt-1 text-xs text-gray-500">
                L'article sera visible par les apprenantes.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-5 w-5 accent-purple-600"
            />
          </div>

          {/* Actions */}

<div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
  <button
    type="button"
    onClick={() =>
      router.push(`/expert/courses/${courseId}/articles`)
    }
    disabled={saving || deleting}
    className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Annuler
  </button>

  <button
    type="submit"
    disabled={saving || deleting}
    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {saving ? (
      <Loader2 size={17} className="animate-spin" />
    ) : (
      <Save size={17} />
    )}

    {saving ? "Enregistrement..." : "Enregistrer"}
  </button>
</div>


        </form>
      </div>
    </main>
  );
}

