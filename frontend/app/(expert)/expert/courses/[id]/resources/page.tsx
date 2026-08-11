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
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

function getFileUrl(url?: string | null) {
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

function formatFileSize(value?: number | string | null) {
  if (value === null || value === undefined) return "";

  const bytes = Number(value);

  if (!Number.isFinite(bytes) || bytes <= 0) return "";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResourcesPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;

    async function loadResources() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/courses/${courseId}/resources`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            json?.message || "Impossible de charger les ressources."
          );
        }

        const data =
          json?.data ||
          json?.resources ||
          [];

        setResources(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Erreur ressources:", err);
        setError(
          err?.message || "Impossible de charger les ressources."
        );
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [courseId, router]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">

            <button
              onClick={() =>
                router.push(`/expert/courses/${courseId}`)
              }
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
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
                Gérez les fichiers et documents pédagogiques de votre cours.
              </p>
            </div>

          </div>

          <Button
            onClick={() =>
              router.push(
                `/expert/courses/${courseId}/resources/create`
              )
            }
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
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
              <File size={30} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Aucune ressource
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Ajoutez des PDF, modèles, documents ou autres fichiers utiles
              aux entrepreneures.
            </p>

            <button
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}/resources/create`
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              <Plus size={16} />
              Ajouter une ressource
            </button>

          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {resources.map((resource) => {
              const fileUrl = getFileUrl(resource.fileUrl);

              return (
                <article
                  key={resource.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  {/* COVER */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50">

                    {resource.coverUrl ? (
                      <img
                        src={getFileUrl(resource.coverUrl) || ""}
                        alt={resource.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-purple-400">
                        <FileText size={48} />
                        <span className="mt-3 text-xs font-semibold uppercase">
                          {resource.type || "Fichier"}
                        </span>
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-purple-700">
                      {resource.type || "Ressource"}
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

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {formatFileSize(resource.fileSizeBytes)}
                      </span>

                      <span>
                        {resource.downloadCount || 0} téléchargements
                      </span>
                    </div>

                    <div className="mt-5 flex gap-2">

                      <button
                        onClick={() =>
                          router.push(
                            `/expert/courses/${courseId}/resources/${resource.id}`
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye size={15} />
                        Ouvrir
                      </button>

                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100"
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