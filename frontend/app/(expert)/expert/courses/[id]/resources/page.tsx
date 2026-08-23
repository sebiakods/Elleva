"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  File,
  FileText,
  Download,
  Plus,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

const API_URL = '/api';

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

type Resource = {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  fileUrl?: string | null;
  coverUrl?: string | null;
  fileSizeBytes?: number | string | null;
  downloadCount?: number;
  isPublished?: boolean;
  order?: number;
  createdAt?: string;
};

/**
 * Converts relative backend file paths into absolute URLs.
 *
 * Absolute URLs such as Backblaze B2 URLs are returned unchanged.
 */
function getFileUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  // B2 / S3 / external URLs
  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // Backend-relative URL
  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
}

function formatFileSize(
  value?: number | string | null
): string {
  if (value === null || value === undefined) {
    return "";
  }

  const bytes = Number(value);

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function ResourcesPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) {
      return;
    }

    async function loadResources() {
      try {
        setLoading(true);
        setError("");

        /**
         * Authentication is handled by the HTTP-only cookie.
         *
         * Do NOT use localStorage or manually send Authorization.
         */
        const response = await fetch(
          `${API_URL}/courses/${courseId}/resources`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const json = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }

          throw new Error(
            json?.message ||
              "Impossible de charger les ressources."
          );
        }

        const data =
          json?.data ||
          json?.resources ||
          [];

        setResources(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Erreur ressources:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les ressources."
        );
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [courseId, router]);

  function goBackToCourse() {
    router.push(
      `/expert/courses/${courseId}`
    );
  }

  function goToCreateResource() {
    router.push(
      `/expert/courses/${courseId}/resources/create`
    );
  }

  function openResource(resourceId: string) {
    router.push(
      `/expert/courses/${courseId}/resources/${resourceId}`
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={goBackToCourse}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
              aria-label="Retour au cours"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p className="text-sm text-gray-500">
                Espace Experte / Cours / Ressources
              </p>

              <h1 className="mt-1 text-3xl font-semibold text-gray-900">
                Ressources
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Gérez les fichiers et documents
                pédagogiques de votre cours.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={goToCreateResource}
          >
            <Plus size={17} />
            Ajouter une ressource
          </Button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-sm text-gray-500">
              Chargement des ressources...
            </p>
          </div>
        ) : resources.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
              <File size={30} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Aucune ressource
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Ajoutez des PDF, modèles,
              documents ou autres fichiers
              utiles aux entrepreneures.
            </p>

            <button
              type="button"
              onClick={goToCreateResource}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              <Plus size={16} />
              Ajouter une ressource
            </button>
          </div>
        ) : (
          /* RESOURCE GRID */
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => {
              const fileUrl = getFileUrl(
                resource.fileUrl
              );

              const coverUrl = getFileUrl(
                resource.coverUrl
              );

              return (
                <article
                  key={resource.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* COVER */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={resource.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-purple-400">
                        <FileText size={48} />

                        <span className="mt-3 text-xs font-semibold uppercase">
                          {resource.type ||
                            "Fichier"}
                        </span>
                      </div>
                    )}

                    {/* TYPE */}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm backdrop-blur-sm">
                      {resource.type ||
                        "Ressource"}
                    </span>

                    {/* PUBLICATION STATUS */}
                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
                        resource.isPublished
                          ? "bg-green-100/95 text-green-700"
                          : "bg-gray-100/95 text-gray-600"
                      }`}
                    >
                      {resource.isPublished
                        ? "Publié"
                        : "Brouillon"}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
                      {resource.title}
                    </h2>

                    {resource.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                        {resource.description}
                      </p>
                    )}

                    {/* META */}
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-500">
                      <span>
                        {formatFileSize(
                          resource.fileSizeBytes
                        )}
                      </span>

                      <span>
                        {resource.downloadCount ||
                          0}{" "}
                        téléchargement
                        {(resource.downloadCount ||
                          0) !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openResource(
                            resource.id
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Eye size={15} />
                        Ouvrir
                      </button>

                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 transition hover:bg-purple-100"
                          title="Télécharger / ouvrir le fichier"
                          aria-label={`Télécharger ${resource.title}`}
                        >
                          <Download size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}