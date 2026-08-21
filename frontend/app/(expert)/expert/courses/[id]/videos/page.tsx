"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Film,
  Loader2,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

type Video = {
  id: string;
  title: string;
  description?: string | null;
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  views?: number | null;
  category?: string | null;
  isPublished?: boolean;
  order?: number | null;
};

type Course = {
  id: string;
  title: string;
};

/**
 * Converts a stored file URL/path into a usable browser URL.
 *
 * - Full HTTP/HTTPS URLs are returned unchanged.
 * - blob URLs are returned unchanged.
 * - Relative backend paths are prefixed with the backend URL.
 */
function getFileUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("blob:")
  ) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith("/")) {
    return `${BACKEND_URL}${trimmedUrl}`;
  }

  return `${BACKEND_URL}/${trimmedUrl}`;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) {
    return "Vidéo";
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  if (minutes === 0) {
    return `${remaining}s`;
  }

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

const PLACEHOLDER_PALETTES = [
  {
    bg: "from-purple-500 to-purple-700",
    accent: "bg-purple-400",
  },
  {
    bg: "from-rose-500 to-rose-700",
    accent: "bg-rose-400",
  },
  {
    bg: "from-indigo-500 to-indigo-700",
    accent: "bg-indigo-400",
  },
  {
    bg: "from-amber-500 to-orange-600",
    accent: "bg-amber-400",
  },
  {
    bg: "from-teal-500 to-cyan-700",
    accent: "bg-teal-400",
  },
];

function pickPalette(title: string) {
  const index =
    title
      .split("")
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
    PLACEHOLDER_PALETTES.length;

  return PLACEHOLDER_PALETTES[index];
}

function VideoCoverPlaceholder({
  title,
  category,
}: {
  title: string;
  category?: string | null;
}) {
  const palette = pickPalette(title);

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br ${palette.bg} p-5`}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

      <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />

      <div className="relative z-10 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.accent} text-white shadow-lg`}
        >
          <Film size={24} />
        </div>

        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          Vidéo
        </span>
      </div>

      <div className="relative z-10">
        {category && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
            {category}
          </p>
        )}

        <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight text-white">
          {title}
        </h3>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
          <PlayCircle size={28} />
        </div>
      </div>
    </div>
  );
}

export default function CourseVideosPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    loadData();
  }, [courseId]);

  /**
   * Authentication:
   *
   * We DO NOT read localStorage anymore.
   *
   * The backend authentication cookie is HTTP-only,
   * so the browser sends it automatically with:
   *
   * credentials: "include"
   */
  async function loadData() {
    try {
      setLoading(true);

      const [courseResponse, videosResponse] = await Promise.all([
        fetch(`${API_URL}/courses/${encodeURIComponent(courseId)}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }),

        fetch(
          `${API_URL}/courses/${encodeURIComponent(courseId)}/videos`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        ),
      ]);

      const courseText = await courseResponse.text();
      const videosText = await videosResponse.text();

      let courseJson: any = {};
      let videosJson: any = {};

      try {
        courseJson = courseText ? JSON.parse(courseText) : {};
      } catch {
        throw new Error(
          "Le serveur a retourné une réponse invalide pour le cours."
        );
      }

      try {
        videosJson = videosText ? JSON.parse(videosText) : {};
      } catch {
        throw new Error(
          "Le serveur a retourné une réponse invalide pour les vidéos."
        );
      }

      if (!courseResponse.ok) {
        throw new Error(
          courseJson?.message ||
            courseJson?.error ||
            `Impossible de charger le cours (${courseResponse.status}).`
        );
      }

      if (!videosResponse.ok) {
        throw new Error(
          videosJson?.message ||
            videosJson?.error ||
            `Impossible de charger les vidéos (${videosResponse.status}).`
        );
      }

      setCourse(courseJson?.data ?? courseJson);

      const videosData = Array.isArray(videosJson?.data)
        ? videosJson.data
        : Array.isArray(videosJson)
          ? videosJson
          : [];

      setVideos(videosData);
    } catch (error) {
      console.error("Error loading videos:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de charger les vidéos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteVideo(videoId: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette vidéo ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(videoId);

      const response = await fetch(
        `${API_URL}/courses/${encodeURIComponent(
          courseId
        )}/videos/${encodeURIComponent(videoId)}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      let json: any = {};

      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        // The response may be empty.
      }

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Impossible de supprimer la vidéo (${response.status}).`
        );
      }

      setVideos((current) =>
        current.filter((video) => video.id !== videoId)
      );
    } catch (error) {
      console.error("Delete video error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Vidéos" />

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <Loader2
              size={20}
              className="animate-spin text-wine-700"
            />

            Chargement des vidéos...
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Vidéos" />

        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <Film
            size={42}
            className="mx-auto mb-4 text-ink-soft/50"
          />

          <h1 className="font-display text-2xl font-semibold text-wine-900">
            Cours introuvable
          </h1>

          <p className="mt-2 text-sm text-ink-soft">
            Le cours demandé n&apos;existe pas ou n&apos;est plus
            disponible.
          </p>

          <button
            type="button"
            onClick={() => router.push("/expert/courses")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
          >
            <ArrowLeft size={17} />
            Retour aux cours
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <Header title="Vidéos" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <Link
            href="/expert/courses"
            className="transition hover:text-wine-700"
          >
            Cours
          </Link>

          <span>/</span>

          <Link
            href={`/expert/courses/${encodeURIComponent(courseId)}`}
            className="max-w-[220px] truncate transition hover:text-wine-700"
          >
            {course.title}
          </Link>

          <span>/</span>

          <span className="font-medium text-wine-900">
            Vidéos
          </span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${encodeURIComponent(courseId)}`
                )
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
            >
              <ArrowLeft size={17} />
              Retour au cours
            </button>

            <h1 className="font-display text-3xl font-semibold text-wine-900">
              Vidéos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Gérez les vidéos pédagogiques de ce cours.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() =>
              router.push(
                `/expert/courses/${encodeURIComponent(
                  courseId
                )}/videos/create`
              )
            }
          >
            <Plus size={17} />
            Ajouter une vidéo
          </Button>
        </div>

        {/* Course information */}
        <section className="mb-6 rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Cours
              </p>

              <h2 className="mt-1 font-display text-xl font-semibold text-wine-900">
                {course.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-ink-soft">
                {videos.length} vidéo
                {videos.length !== 1 ? "s" : ""}
              </span>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/expert/courses/${encodeURIComponent(courseId)}`
                  )
                }
                className="rounded-xl border border-sand-200 px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-sand-50"
              >
                Voir le cours
              </button>
            </div>
          </div>
        </section>

        {/* Empty state */}
        {videos.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-sand-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-wine-50 text-wine-700">
              <Film size={30} />
            </div>

            <h2 className="font-display text-xl font-semibold text-wine-900">
              Aucune vidéo
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
              Ajoutez des vidéos pédagogiques pour enrichir le
              parcours d&apos;apprentissage de vos entrepreneures.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${encodeURIComponent(
                    courseId
                  )}/videos/create`
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
            >
              <Plus size={17} />
              Ajouter la première vidéo
            </button>
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => {
              const videoUrl = getFileUrl(video.videoUrl);

              const thumbnailUrl = getFileUrl(
                video.thumbnailUrl
              );

              return (
                <article
                  key={video.id}
                  className="group overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Cover */}
                  <div className="relative h-40 overflow-hidden bg-wine-50">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <VideoCoverPlaceholder
                        title={video.title}
                        category={video.category}
                      />
                    )}

                    <div className="absolute left-4 top-4">
                      <Badge
                        tone={
                          video.isPublished
                            ? "rose"
                            : "neutral"
                        }
                      >
                        {video.isPublished
                          ? "Publié"
                          : "Brouillon"}
                      </Badge>
                    </div>

                    {video.durationSeconds ? (
                      <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
                        {formatDuration(
                          video.durationSeconds
                        )}
                      </span>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-wine-50 px-2.5 py-1 text-[11px] font-semibold text-wine-700">
                        {video.category || "Vidéo"}
                      </span>

                      {video.order != null &&
                        video.order > 0 && (
                          <span className="text-xs text-ink-soft">
                            #{video.order}
                          </span>
                        )}
                    </div>

                    <h2 className="line-clamp-2 font-display text-lg font-semibold text-wine-900">
                      {video.title}
                    </h2>

                    {video.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">
                        {video.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
                      <span>
                        {formatDuration(
                          video.durationSeconds
                        )}
                      </span>

                      <span>
                        {video.views ?? 0} vues
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        href={`/expert/courses/${encodeURIComponent(
                          courseId
                        )}/videos/${encodeURIComponent(
                          video.id
                        )}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-semibold text-wine-900 transition hover:bg-sand-50"
                      >
                        Ouvrir
                      </Link>

                      {videoUrl && (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700 transition hover:bg-wine-100"
                          title="Voir la vidéo"
                          aria-label="Voir la vidéo"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteVideo(video.id)
                        }
                        disabled={
                          deletingId === video.id
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-soft transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Supprimer"
                        aria-label="Supprimer la vidéo"
                      >
                        {deletingId === video.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
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