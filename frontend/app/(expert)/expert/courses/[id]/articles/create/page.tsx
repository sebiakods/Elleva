"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";

import { API_BASE_URL as API_URL } from "@/services/api";

type Course = {
  id: string;
  title: string;
};

type ApiResponse<T = unknown> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

/**
 * Safely extract an API error message.
 */
function getErrorMessage(
  data: ApiResponse,
  fallback: string
): string {
  return data.message || data.error || fallback;
}

export default function CreateArticlePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = String(params.id || "");

  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const [course, setCourse] = useState<Course | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");

  const [excerpt, setExcerpt] = useState("");

  const [content, setContent] = useState("");

  const [category, setCategory] = useState("");

  const [readTimeMinutes, setReadTimeMinutes] = useState(5);

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  /**
   * Load course information.
   *
   * Authentication is handled by the HTTP-only cookie.
   *
   * IMPORTANT:
   * We do NOT use localStorage.
   * We do NOT manually send Authorization headers.
   */
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setError("Identifiant du cours manquant.");
      return;
    }

    let cancelled = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/courses/${courseId}`,
          {
            method: "GET",

            /**
             * Send the HTTP-only authentication cookie.
             */
            credentials: "include",

            headers: {
              Accept: "application/json",
            },

            cache: "no-store",
          }
        );

        const data: ApiResponse<Course> =
          await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }

          throw new Error(
            getErrorMessage(
              data,
              "Impossible de charger le cours."
            )
          );
        }

        if (!data.data) {
          throw new Error(
            "Les informations du cours sont introuvables."
          );
        }

        if (!cancelled) {
          setCourse(data.data);
        }
      } catch (err) {
        console.error("LOAD COURSE ERROR:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger le cours."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [courseId, router]);

  /**
   * Handle PDF selection.
   */
  function handlePdfChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    /**
     * Accept both MIME type and .pdf extension.
     *
     * Some browsers can occasionally return an empty MIME type.
     */
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError(
        "Veuillez sélectionner uniquement un fichier PDF."
      );

      event.target.value = "";
      setPdfFile(null);
      return;
    }

    /**
     * Maximum PDF size: 100 MB.
     */
    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Le fichier PDF ne doit pas dépasser 100 MB."
      );

      event.target.value = "";
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  }

  /**
   * Remove selected PDF.
   */
  function removePdf() {
    setPdfFile(null);

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  }

  /**
   * Create article.
   *
   * Uses FormData because the request contains
   * both text fields and an optional PDF file.
   */
  async function createArticle(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const cleanTitle = title.trim();
    const cleanExcerpt = excerpt.trim();
    const cleanContent = content.trim();
    const cleanCategory = category.trim();

    if (!cleanTitle) {
      setError(
        "Veuillez renseigner le titre de l'article."
      );
      return;
    }

    if (cleanTitle.length > 200) {
      setError(
        "Le titre ne peut pas dépasser 200 caractères."
      );
      return;
    }

    if (!cleanContent) {
      setError(
        "Veuillez renseigner le contenu de l'article."
      );
      return;
    }

    if (!cleanCategory) {
      setError(
        "Veuillez renseigner la catégorie."
      );
      return;
    }

    const validReadTime =
      Number.isFinite(readTimeMinutes) &&
      readTimeMinutes >= 1;

    if (!validReadTime) {
      setError(
        "Le temps de lecture doit être d'au moins 1 minute."
      );
      return;
    }

    if (!courseId) {
      setError(
        "Identifiant du cours manquant."
      );
      return;
    }

    try {
      setSaving(true);

      /**
       * Build multipart/form-data.
       */
      const formData = new FormData();

      formData.append(
        "title",
        cleanTitle
      );

      formData.append(
        "excerpt",
        cleanExcerpt
      );

      formData.append(
        "content",
        cleanContent
      );

      formData.append(
        "category",
        cleanCategory
      );

      formData.append(
        "readTimeMinutes",
        String(
          Math.max(
            1,
            Math.floor(readTimeMinutes)
          )
        )
      );

      /**
       * IMPORTANT:
       *
       * This must match your backend multer field:
       *
       * upload.single("pdfFile")
       */
      if (pdfFile) {
        formData.append(
          "pdfFile",
          pdfFile
        );
      }

      const response = await fetch(
        `${API_URL}/courses/${courseId}/articles`,
        {
          method: "POST",

          /**
           * IMPORTANT:
           *
           * Authentication cookie is sent automatically.
           *
           * DO NOT use:
           * Authorization: Bearer ...
           *
           * DO NOT use localStorage.
           */
          credentials: "include",

          /**
           * DO NOT manually set Content-Type.
           *
           * The browser automatically creates:
           *
           * multipart/form-data;
           * boundary=...
           */
          body: formData,

          cache: "no-store",
        }
      );

      const data: ApiResponse =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        throw new Error(
          getErrorMessage(
            data,
            "Impossible de créer l'article."
          )
        );
      }

      /**
       * Article successfully created.
       */
      router.push(
        `/expert/courses/${courseId}/articles`
      );

      router.refresh();
    } catch (err) {
      console.error(
        "CREATE ARTICLE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création de l'article."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <>
        <Header title="Créer un article" />

        <main className="min-h-screen bg-sand-50 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="card-surface flex min-h-[300px] flex-col items-center justify-center p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-50">
                <Loader2
                  size={22}
                  className="animate-spin text-wine-700"
                />
              </div>

              <p className="mt-4 text-sm text-ink-soft">
                Chargement du cours...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /**
   * Course not found / loading error.
   */
  if (!course) {
    return (
      <>
        <Header title="Créer un article" />

        <main className="min-h-screen bg-sand-50 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="card-surface p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-wine-50">
                <FileText
                  size={26}
                  className="text-wine-700"
                />
              </div>

              <h1 className="mt-4 font-display text-xl font-semibold text-wine-900">
                Cours introuvable
              </h1>

              <p className="mt-2 text-sm text-ink-soft">
                {error ||
                  "Le cours demandé n'existe pas ou n'est plus disponible."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/expert/courses/${courseId}/articles`
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
              >
                <ArrowLeft size={16} />
                Retour aux articles
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Créer un article" />

      <main className="min-h-screen bg-sand-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-ink-soft">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}`
                )
              }
              className="transition hover:text-wine-700"
            >
              Cours
            </button>

            <span className="mx-2 text-ink-soft/40">
              /
            </span>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}/articles`
                )
              }
              className="transition hover:text-wine-700"
            >
              Articles
            </button>

            <span className="mx-2 text-ink-soft/40">
              /
            </span>

            <span className="font-medium text-wine-700">
              Créer
            </span>
          </div>

          {/* Page header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}/articles`
                )
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
            >
              <ArrowLeft size={17} />
              Retour aux articles
            </button>

            <h1 className="font-display text-3xl font-semibold text-wine-900">
              Créer un article
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Ajouter une nouvelle leçon au cours{" "}
              <span className="font-semibold text-wine-900">
                {course.title}
              </span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={() => setError(null)}
                className="shrink-0 rounded-lg p-1 transition hover:bg-rose-100"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={createArticle}
            className="card-surface space-y-7 p-5 shadow-card sm:p-7"
          >
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-ink"
              >
                Titre de l'article
                <span className="ml-1 text-rose-500">
                  *
                </span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex. Comprendre son marché cible"
                maxLength={200}
                disabled={saving}
                required
                className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 disabled:cursor-not-allowed disabled:bg-sand-50"
              />

              <p className="text-right text-xs text-ink-soft">
                {title.length}/200
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label
                htmlFor="excerpt"
                className="block text-sm font-semibold text-ink"
              >
                Résumé
                <span className="ml-1 text-xs font-normal text-ink-soft">
                  (optionnel)
                </span>
              </label>

              <textarea
                id="excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(event.target.value)
                }
                placeholder="Courte description de cette leçon..."
                rows={3}
                disabled={saving}
                className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 disabled:cursor-not-allowed disabled:bg-sand-50"
              />
            </div>

            {/* Category + read time */}
            <div className="grid gap-5 md:grid-cols-2">

              {/* Category */}
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-ink"
                >
                  Catégorie
                  <span className="ml-1 text-rose-500">
                    *
                  </span>
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  placeholder="Ex. Business Plan"
                  disabled={saving}
                  required
                  className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 disabled:cursor-not-allowed disabled:bg-sand-50"
                />
              </div>

              {/* Read time */}
              <div className="space-y-2">
                <label
                  htmlFor="readTime"
                  className="block text-sm font-semibold text-ink"
                >
                  Temps de lecture
                </label>

                <div className="relative">
                  <input
                    id="readTime"
                    name="readTimeMinutes"
                    type="number"
                    min={1}
                    max={999}
                    step={1}
                    value={readTimeMinutes}
                    onChange={(event) => {
                      const value = Number(
                        event.target.value
                      );

                      setReadTimeMinutes(
                        Number.isFinite(value)
                          ? value
                          : 1
                      );
                    }}
                    disabled={saving}
                    className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-3 pr-24 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50 disabled:cursor-not-allowed disabled:bg-sand-50"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
                    minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-ink"
              >
                Contenu
                <span className="ml-1 text-rose-500">
                  *
                </span>
              </label>

              <textarea
                id="content"
                name="content"
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder="Rédigez le contenu complet de votre article..."
                rows={16}
                disabled={saving}
                required
                className="w-full resize-y rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 disabled:cursor-not-allowed disabled:bg-sand-50"
              />

              <p className="text-xs text-ink-soft">
                {content.length} caractères
              </p>
            </div>

            {/* PDF upload */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-ink">
                Document PDF
                <span className="ml-1 text-xs font-normal text-ink-soft">
                  (optionnel)
                </span>
              </label>

              {!pdfFile ? (
                <label
                  htmlFor="pdfFile"
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                    saving
                      ? "cursor-not-allowed border-sand-200 bg-sand-50 opacity-60"
                      : "cursor-pointer border-sand-200 bg-sand-50 hover:border-rose-300 hover:bg-rose-50"
                  }`}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Upload size={22} />
                  </div>

                  <p className="font-semibold text-ink">
                    Télécharger un PDF
                  </p>

                  <p className="mt-1 text-sm text-ink-soft">
                    Cliquez pour sélectionner votre document
                  </p>

                  <p className="mt-2 text-xs text-ink-soft/70">
                    PDF uniquement • Maximum 100 MB
                  </p>

                  <input
                    ref={pdfInputRef}
                    id="pdfFile"
                    name="pdfFile"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfChange}
                    disabled={saving}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {pdfFile.name}
                      </p>

                      <p className="mt-0.5 text-xs text-ink-soft">
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
                    disabled={saving}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Supprimer le PDF"
                    aria-label="Supprimer le PDF"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-end">
  <Button
    type="button"
    variant="secondary"
    onClick={() =>
      router.push(`/expert/courses/${courseId}/articles`)
    }
  >
    Annuler
  </Button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rise-gradient px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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