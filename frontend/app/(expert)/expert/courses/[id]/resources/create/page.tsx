"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Course = {
  id: string;
  title: string;
};

export default function CreateResourcePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PDF");
  const [order, setOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(
          `${API_URL}/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            json.message ||
              "Impossible de charger le cours."
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

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const maxSize = 100 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      alert(
        "Le fichier ne doit pas dépasser 100 MB."
      );

      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  function removeFile() {
    setFile(null);

    const input = document.getElementById(
      "resource-file"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function createResource(e: FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Veuillez renseigner le titre de la ressource.");
      return;
    }

    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      }

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim()
      );
      formData.append("type", type.trim());
      formData.append("order", String(Number(order)));
      formData.append(
        "isPublished",
        String(isPublished)
      );

      /*
       * IMPORTANT:
       * Send the real file as "files".
       *
       * This follows the same multipart convention
       * already used by the article system.
       */
      formData.append("file", file);

      const res = await fetch(
        `${API_URL}/courses/${courseId}/resources`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.message ||
            "Impossible de créer la ressource."
        );
      }

      router.push(
        `/expert/courses/${courseId}/resources`
      );
    } catch (error) {
      console.error(
        "Create resource error:",
        error
      );

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

  if (!course) {
    return (
      <main className="p-6">
        <div className="card-surface p-10 text-center">
          <p className="text-sm text-gray-500">
            Cours introuvable.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/courses/${courseId}/resources`
              )
            }
            className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            Retour aux ressources
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/courses/${courseId}/resources`
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

        {/* Form */}
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
            </label>

            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Ex. Guide du Business Plan"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
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
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Décrivez brièvement cette ressource..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 leading-6 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
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
                onChange={(e) =>
                  setType(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              >
                <option value="PDF">PDF</option>
                <option value="DOCUMENT">
                  Document
                </option>
                <option value="GUIDE">Guide</option>
                <option value="TEMPLATE">
                  Template
                </option>
                <option value="CHECKLIST">
                  Checklist
                </option>
                <option value="OTHER">Autre</option>
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
                value={order}
                onChange={(e) =>
                  setOrder(Number(e.target.value))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {/* File */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800">
              Fichier
            </label>

            {!file ? (
              <label
                htmlFor="resource-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center transition hover:border-purple-300 hover:bg-purple-50"
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
                  Maximum 100 MB
                </p>

                <input
                  id="resource-file"
                  type="file"
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
                      {(file.size / 1024 / 1024).toFixed(
                        2
                      )}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-red-600"
                  title="Supprimer le fichier"
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
              type="checkbox"
              checked={isPublished}
              onChange={(e) =>
                setIsPublished(e.target.checked)
              }
              className="h-5 w-5 accent-purple-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}/resources`
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
                : "Créer la ressource"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}