"use client";

import {
  useEffect,
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

const API_URL = '/api';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

type Course = {
  id: string;
  title: string;
};

type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export default function CreateResourcePage() {
  const params = useParams();
  const router = useRouter();

  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [course, setCourse] = useState<Course | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PDF");
  const [order, setOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * --------------------------------------------------------------------------
   * Load course
   * --------------------------------------------------------------------------
   *
   * Authentication is handled by the HTTP-only cookie.
   *
   * IMPORTANT:
   * Do NOT read accessToken from localStorage.
   */
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setError("Identifiant du cours invalide.");
      return;
    }

    let cancelled = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/courses/${encodeURIComponent(courseId)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data =
          (await response.json().catch(() => null)) as ApiResponse<Course> | null;

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Impossible de charger le cours."
          );
        }

        if (!data?.data) {
          throw new Error("Les informations du cours sont introuvables.");
        }

        if (!cancelled) {
          setCourse(data.data);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Load course error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le cours."
        );

        setCourse(null);
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
  }, [courseId]);

  /**
   * --------------------------------------------------------------------------
   * File selection
   * --------------------------------------------------------------------------
   */
  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setSuccess("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Le fichier ne doit pas dépasser 100 MB.");

      event.target.value = "";
      setFile(null);

      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".txt",
      ".zip",
    ];

    const isAllowed = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!isAllowed) {
      setError(
        "Format de fichier non pris en charge. Utilisez PDF, Word, Excel, PowerPoint, TXT ou ZIP."
      );

      event.target.value = "";
      setFile(null);

      return;
    }

    setFile(selectedFile);
  }

  /**
   * --------------------------------------------------------------------------
   * Remove selected file
   * --------------------------------------------------------------------------
   */
  function removeFile() {
    setFile(null);
    setError("");

    const input = document.getElementById(
      "resource-file"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Create resource
   * --------------------------------------------------------------------------
   */
  async function createResource(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!courseId) {
      setError("Identifiant du cours invalide.");
      return;
    }

    if (!title.trim()) {
      setError("Veuillez renseigner le titre de la ressource.");
      return;
    }

    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    if (order < 0 || !Number.isInteger(order)) {
      setError("La position doit être un nombre entier positif.");
      return;
    }

    try {
      setSaving(true);

      /**
       * FormData is required because we are uploading a real file.
       *
       * DO NOT set:
       *
       * Content-Type: multipart/form-data
       *
       * The browser automatically creates the correct boundary.
       */

      const formData = new FormData();

      formData.append("title", title.trim());

      if (description.trim()) {
        formData.append("description", description.trim());
      }

      formData.append("type", type);
      formData.append("order", String(order));
      formData.append("isPublished", String(isPublished));

      /**
       * IMPORTANT:
       *
       * The backend Multer field name must be "file".
       *
       * Therefore this must stay:
       *
       * formData.append("file", file);
       */
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/courses/${encodeURIComponent(courseId)}/resources`,
        {
          method: "POST",

          /**
           * Send the HTTP-only authentication cookie.
           */
          credentials: "include",

          /**
           * Do NOT set Content-Type here.
           */
          body: formData,

          cache: "no-store",
        }
      );

      const data =
        (await response.json().catch(() => null)) as ApiResponse | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Impossible de créer la ressource (${response.status}).`
        );
      }

      setSuccess("La ressource a été créée avec succès.");

      /**
       * Small delay so the success message can be displayed.
       */
      setTimeout(() => {
        router.push(
          `/expert/courses/${encodeURIComponent(courseId)}/resources`
        );

        router.refresh();
      }, 500);
    } catch (err) {
      console.error("Create resource error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création de la ressource."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Loading state
   * --------------------------------------------------------------------------
   */
  if (loading) {
    return (
      <main className="p-6">
        <div className="card-surface flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Chargement du cours...
          </div>
        </div>
      </main>
    );
  }

  /**
   * --------------------------------------------------------------------------
   * Course not found
   * --------------------------------------------------------------------------
   */
  if (!course) {
    return (
      <main className="p-6">
        <div className="card-surface p-10 text-center">
          <FileText
            size={40}
            className="mx-auto mb-4 text-gray-300"
          />

          <h1 className="text-lg font-semibold text-gray-900">
            Cours introuvable
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Impossible de charger les informations de ce cours.
          </p>

          {error && (
            <p className="mx-auto mt-3 max-w-lg text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/courses/${encodeURIComponent(
                  courseId
                )}/resources`
              )
            }
            className="mt-5 text-sm font-medium text-purple-600 transition hover:text-purple-700"
          >
            Retour aux ressources
          </button>
        </div>
      </main>
    );
  }

  /**
   * --------------------------------------------------------------------------
   * Main page
   * --------------------------------------------------------------------------
   */
  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl">

        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/courses/${encodeURIComponent(
                  courseId
                )}/resources`
              )
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-purple-600"
          >
            <ArrowLeft size={16} />

            Retour aux ressources
          </button>

          <h1 className="text-2xl font-semibold text-gray-900">
            Ajouter une ressource
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Ajouter un document au cours{" "}
            <span className="font-medium text-gray-700">
              {course.title}
            </span>
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Messages                                                           */}
        {/* ------------------------------------------------------------------ */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Form                                                               */}
        {/* ------------------------------------------------------------------ */}

        <form
          onSubmit={createResource}
          className="card-surface space-y-6 p-6"
        >
          {/* Title */}

          <div className="space-y-2">
            <label
              htmlFor="resource-title"
              className="text-sm font-medium text-gray-800"
            >
              Titre de la ressource
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Ex. Guide du Business Plan"
              maxLength={200}
              disabled={saving}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          {/* Description */}

          <div className="space-y-2">
            <label
              htmlFor="resource-description"
              className="text-sm font-medium text-gray-800"
            >
              Description
            </label>

            <textarea
              id="resource-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Décrivez brièvement cette ressource..."
              rows={4}
              maxLength={2000}
              disabled={saving}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 leading-6 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          {/* Type + order */}

          <div className="grid gap-5 md:grid-cols-2">

            <div className="space-y-2">
              <label
                htmlFor="resource-type"
                className="text-sm font-medium text-gray-800"
              >
                Type
              </label>

              <select
                id="resource-type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="PDF">PDF</option>
                <option value="DOCUMENT">
                  Document
                </option>
                <option value="GUIDE">
                  Guide
                </option>
                <option value="TEMPLATE">
                  Template
                </option>
                <option value="CHECKLIST">
                  Checklist
                </option>
                <option value="OTHER">
                  Autre
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="resource-order"
                className="text-sm font-medium text-gray-800"
              >
                Position
              </label>

              <input
                id="resource-order"
                type="number"
                min={0}
                step={1}
                value={order}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  setOrder(
                    Number.isFinite(value) && value >= 0
                      ? Math.floor(value)
                      : 0
                  );
                }}
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* File */}

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800">
              Fichier
              <span className="ml-1 text-red-500">*</span>
            </label>

            {!file ? (
              <label
                htmlFor="resource-file"
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  saving
                    ? "cursor-not-allowed border-gray-200 bg-gray-100"
                    : "cursor-pointer border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Upload size={22} />
                </div>

                <p className="font-medium text-gray-800">
                  Télécharger une ressource
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Cliquez pour sélectionner votre fichier
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  PDF, Word, Excel, PowerPoint, TXT ou ZIP — maximum 100 MB
                </p>

                <input
                  id="resource-file"
                  type="file"
                  disabled={saving}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">
                    <FileText size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={saving}
                  className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Supprimer le fichier"
                  aria-label="Supprimer le fichier"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Published */}

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Publier la ressource
              </p>

              <p className="mt-1 text-xs text-gray-500">
                La ressource sera visible par les apprenantes.
              </p>
            </div>

            <input
              id="resource-published"
              type="checkbox"
              checked={isPublished}
              onChange={(event) =>
                setIsPublished(event.target.checked)
              }
              disabled={saving}
              className="h-5 w-5 accent-purple-600 disabled:cursor-not-allowed"
            />
          </div>

          {/* Actions */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(`/expert/courses/${encodeURIComponent(courseId)}/resources`)
              }
            >
              Annuler
            </Button>

            <button
              type="submit"
              disabled={saving || !file}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Création...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Créer la ressource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}