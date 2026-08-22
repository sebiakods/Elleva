"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  Loader2,
  PlayCircle,
  BookOpen,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api"
).replace(/\/$/, "");

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

interface ArticleLesson {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  category?: string | null;
  pdfUrl?: string | null;
  readTimeMinutes?: number | null;
}

interface VideoLesson {
  id: string;
  title: string;
  description?: string | null;
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  mimeType?: string | null;
}

interface ResourceLesson {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  fileUrl?: string | null;
  fileSizeBytes?: number | null;
}

type LessonResponse =
  | {
      type: "article";
      data: ArticleLesson;
    }
  | {
      type: "video";
      data: VideoLesson;
    }
  | {
      type: "resource";
      data: ResourceLesson;
    };

function getFileUrl(url?: string | null): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already a complete URL (including Backblaze signed URL)
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Backend-relative URL
  if (trimmed.startsWith("/")) {
    return `${BACKEND_URL}${trimmed}`;
  }

  return `${BACKEND_URL}/${trimmed}`;
}

function formatDuration(seconds?: number | null): string | null {
  if (
    seconds === undefined ||
    seconds === null ||
    seconds <= 0
  ) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds > 0) {
    return `${minutes} min ${remainingSeconds}s`;
  }

  return `${minutes} min`;
}

export default function LessonPage() {
  const params = useParams();

  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const lessonId =
    typeof params.lessonId === "string"
      ? params.lessonId
      : Array.isArray(params.lessonId)
        ? params.lessonId[0]
        : "";

  const [lesson, setLesson] =
    useState<LessonResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !lessonId) {
      setLoading(false);
      setError("Identifiant de la leçon manquant.");
      return;
    }

    let cancelled = false;

    async function fetchLesson() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/courses/${encodeURIComponent(
            courseId
          )}/lesson/${encodeURIComponent(lessonId)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        let json: unknown = null;

        try {
          json = await response.json();
        } catch {
          json = null;
        }

        if (!response.ok) {
          let message =
            "Impossible de charger cette leçon.";

          if (
            typeof json === "object" &&
            json !== null &&
            "message" in json &&
            typeof json.message === "string"
          ) {
            message = json.message;
          } else if (response.status === 401) {
            message =
              "Votre session a expiré. Veuillez vous reconnecter.";
          } else if (response.status === 403) {
            message =
              "Vous n'avez pas accès à cette leçon.";
          } else if (response.status === 404) {
            message =
              "Cette leçon n'existe pas ou n'est plus disponible.";
          }

          throw new Error(message);
        }

        const responseData =
          typeof json === "object" &&
          json !== null &&
          "data" in json
            ? json.data
            : json;

        if (
          !responseData ||
          typeof responseData !== "object"
        ) {
          throw new Error(
            "Les données de cette leçon sont invalides."
          );
        }

        if (
          !("type" in responseData) ||
          !("data" in responseData)
        ) {
          throw new Error(
            "Le format de la leçon est invalide."
          );
        }

        const lessonData =
          responseData as LessonResponse;

        if (
          lessonData.type !== "article" &&
          lessonData.type !== "video" &&
          lessonData.type !== "resource"
        ) {
          throw new Error(
            "Type de leçon non reconnu."
          );
        }

        if (!cancelled) {
          setLesson(lessonData);
        }
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Erreur de chargement de la leçon:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger cette leçon."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLesson();

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2
          size={32}
          className="animate-spin text-[#e0156a]"
        />

        <p className="font-body text-sm text-[#7a1352]/70">
          Chargement de la leçon...
        </p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="mb-6 inline-flex items-center gap-2 font-body text-sm font-medium text-[#e0156a] transition hover:text-[#7a1352]"
        >
          <ArrowLeft size={16} />
          Retour à la formation
        </Link>

        <div className="card-surface p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe3ee]">
            <BookOpen
              size={28}
              className="text-[#e0156a]"
            />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#1e1620]">
            Leçon introuvable
          </h1>

          <p className="mt-2 font-body text-sm text-[#1e1620]/55">
            {error ||
              "Cette leçon n'existe pas ou n'est plus disponible."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#e0156a] transition hover:text-[#7a1352]"
      >
        <ArrowLeft size={15} />
        Retour à la formation
      </Link>

      {lesson.type === "article" && (
        <ArticleView article={lesson.data} />
      )}

      {lesson.type === "video" && (
        <VideoView video={lesson.data} />
      )}

      {lesson.type === "resource" && (
        <ResourceView resource={lesson.data} />
      )}
    </div>
  );
}

/* ============================================================
   ARTICLE
   ============================================================ */

function ArticleView({
  article,
}: {
  article: ArticleLesson;
}) {
  const pdfUrl = getFileUrl(article.pdfUrl);

  return (
    <article className="card-surface overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-100">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/40" />
        <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-pink-200/50" />

        <div className="relative flex h-full items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/70 bg-white/70 text-[#e0156a] shadow-xl backdrop-blur-sm">
            <BookOpen
              size={42}
              strokeWidth={1.7}
            />
          </div>
        </div>

        <div className="absolute left-5 top-5 rounded-full border border-white/60 bg-white/85 px-3.5 py-1.5 font-body text-xs font-semibold text-[#7a1352] shadow-sm backdrop-blur-sm">
          Leçon écrite
        </div>

        {pdfUrl && (
          <div className="absolute right-5 top-5 rounded-full border border-white/60 bg-white/90 px-3.5 py-1.5 font-body text-xs font-semibold text-[#7a1352] shadow-sm backdrop-blur-sm">
            PDF
          </div>
        )}
      </div>

      <div className="p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {article.category && (
            <span className="rounded-full bg-[#ffe3ee] px-3 py-1 font-body text-[11px] font-semibold text-[#7a1352]">
              {article.category}
            </span>
          )}

          {article.readTimeMinutes && (
            <span className="inline-flex items-center gap-1 font-body text-xs text-[#1e1620]/50">
              <Clock size={12} />
              {article.readTimeMinutes} min de lecture
            </span>
          )}
        </div>

        <h1 className="mb-4 font-display text-2xl font-bold text-[#1e1620]">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mb-6 font-body text-sm italic leading-relaxed text-[#1e1620]/60">
            {article.excerpt}
          </p>
        )}

        <div className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-[#1e1620]/85">
          {article.content}
        </div>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            <FileText size={16} />
            Ouvrir le PDF joint
          </a>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   VIDEO
   ============================================================ */

function VideoView({
  video,
}: {
  video: VideoLesson;
}) {
  const videoSrc = getFileUrl(video.videoUrl);

  const [playbackError, setPlaybackError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  return (
    <article className="card-surface overflow-hidden">
      <div className="relative w-full overflow-hidden bg-black">
        {videoSrc && !playbackError ? (
          <div className="relative aspect-video w-full">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                <Loader2
                  size={42}
                  className="animate-spin text-white"
                />
              </div>
            )}

            <video
              key={videoSrc}
              controls
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              poster={
                getFileUrl(video.thumbnailUrl) ||
                undefined
              }
              className="absolute inset-0 h-full w-full object-contain"
              onLoadedMetadata={() => {
                setIsLoading(false);
              }}
              onCanPlay={() => {
                setIsLoading(false);
              }}
              onError={(event) => {
                setIsLoading(false);

                const mediaError =
                  event.currentTarget.error;

                console.error(
                  "VIDEO URL:",
                  videoSrc
                );

                console.error(
                  "VIDEO ERROR:",
                  mediaError
                );

                setPlaybackError(
                  "Impossible de lire cette vidéo. Vérifiez que le fichier MP4 est accessible depuis Backblaze B2."
                );
              }}
            >
              <source
                src={videoSrc}
                type={
                  video.mimeType ||
                  "video/mp4"
                }
              />

              Votre navigateur ne prend pas en charge
              la lecture vidéo.
            </video>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center text-white/60">
            <PlayCircle size={48} />

            <span className="font-body text-sm">
              {playbackError ||
                "Vidéo indisponible"}
            </span>
          </div>
        )}
      </div>

      <div className="p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {video.category && (
            <span className="rounded-full bg-[#ffe3ee] px-3 py-1 font-body text-[11px] font-semibold text-[#7a1352]">
              {video.category}
            </span>
          )}

          {video.durationSeconds && (
            <span className="inline-flex items-center gap-1 font-body text-xs text-[#1e1620]/50">
              <Clock size={12} />

              {formatDuration(
                video.durationSeconds
              )}
            </span>
          )}
        </div>

        <h1 className="mb-4 font-display text-2xl font-bold text-[#1e1620]">
          {video.title}
        </h1>

        {video.description && (
          <p className="font-body text-sm leading-relaxed text-[#1e1620]/70">
            {video.description}
          </p>
        )}

        {playbackError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-body text-sm text-red-700">
              {playbackError}
            </p>

            <a
              href={videoSrc || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-body text-sm font-semibold text-red-700 underline"
            >
              Ouvrir directement la vidéo
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   RESOURCE
   ============================================================ */

function ResourceView({
  resource,
}: {
  resource: ResourceLesson;
}) {
  const fileHref = getFileUrl(resource.fileUrl);

  return (
    <article className="card-surface overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-100">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/40" />
        <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-pink-200/50" />

        <div className="relative flex h-full items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-white/75 text-[#e0156a] shadow-lg backdrop-blur-sm">
            <FileText
              size={36}
              strokeWidth={1.8}
            />
          </div>
        </div>
      </div>

      <div className="p-7">
        <div className="mb-3 flex items-center gap-2">
          {resource.type && (
            <span className="rounded-full bg-[#f6efe1] px-3 py-1 font-body text-[11px] font-semibold text-[#8a6d1f]">
              {resource.type}
            </span>
          )}
        </div>

        <h1 className="mb-3 font-display text-2xl font-bold text-[#1e1620]">
          {resource.title}
        </h1>

        {resource.description && (
          <p className="mb-6 font-body text-sm leading-relaxed text-[#1e1620]/70">
            {resource.description}
          </p>
        )}

        {fileHref ? (
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            <Download size={16} />
            Télécharger la ressource
          </a>
        ) : (
          <p className="font-body text-sm text-[#1e1620]/50">
            Fichier indisponible.
          </p>
        )}
      </div>
    </article>
  );
}