"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Download,
  FileText,
  Loader2,
  PlayCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

interface ArticleLesson {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  coverUrl?: string | null;
  pdfUrl?: string | null;
  readTimeMinutes?: number;
}

interface VideoLesson {
  id: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  category?: string;
}

interface ResourceLesson {
  id: string;
  title: string;
  description?: string;
  type?: string;
  fileUrl?: string | null;
  coverUrl?: string | null;
  fileSizeBytes?: number | null;
}

type LessonResponse =
  | { type: "article"; data: ArticleLesson }
  | { type: "video"; data: VideoLesson }
  | { type: "resource"; data: ResourceLesson };

function getFileUrl(url?: string | null) {
  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  return url.startsWith("/")
    ? `${BACKEND_URL}${url}`
    : `${BACKEND_URL}/${url}`;
}

function formatDuration(seconds?: number) {
  if (!seconds) return null;

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return remaining > 0
    ? `${minutes} min ${remaining}s`
    : `${minutes} min`;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * Gate on the same static payment flag used by the course page.
   */
  useEffect(() => {
    if (!courseId) return;

    const paid =
      localStorage.getItem(`course_payment_${courseId}`) === "true";

    if (!paid) {
      router.replace(`/dashboard/courses/${courseId}/payment`);
    }
  }, [courseId, router]);

  useEffect(() => {
    if (!courseId || !lessonId) return;

    async function fetchLesson() {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        const res = await fetch(
          `${API_URL}/courses/${courseId}/lesson/${lessonId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error(
            `Erreur ${res.status}: Impossible de charger cette leçon.`
          );
        }

        const json = await res.json();

        setLesson(json.data as LessonResponse);
      } catch (err) {
        console.error("Erreur de chargement de la leçon:", err);
        setError("Impossible de charger cette leçon.");
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#e0156a]" />
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
          className="mb-6 inline-flex items-center gap-2 font-body text-sm font-medium text-[#e0156a] hover:text-[#7a1352]"
        >
          <ArrowLeft size={16} />
          Retour à la formation
        </Link>

        <div className="card-surface p-12 text-center">
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
        className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#e0156a] hover:text-[#7a1352]"
      >
        <ArrowLeft size={15} />
        Retour à la formation
      </Link>

      {lesson.type === "article" && (
        <ArticleView article={lesson.data} />
      )}

      {lesson.type === "video" && <VideoView video={lesson.data} />}

      {lesson.type === "resource" && (
        <ResourceView resource={lesson.data} />
      )}
    </div>
  );
}

function ArticleView({ article }: { article: ArticleLesson }) {
  return (
    <article className="card-surface overflow-hidden">
      {article.coverUrl && (
        <div className="h-56 w-full overflow-hidden">
          <img
            src={getFileUrl(article.coverUrl) || ""}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-7">
        <div className="mb-3 flex items-center gap-2">
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
          <p className="mb-6 font-body text-sm italic text-[#1e1620]/60">
            {article.excerpt}
          </p>
        )}

        <div className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-[#1e1620]/85">
          {article.content}
        </div>

        {article.pdfUrl && (
          <a
            href={getFileUrl(article.pdfUrl) || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] px-5 py-2.5 font-body text-sm font-semibold text-white hover:brightness-105"
          >
            <FileText size={16} />
            Ouvrir le PDF joint
          </a>
        )}
      </div>
    </article>
  );
}

function VideoView({ video }: { video: VideoLesson }) {
  const videoSrc = getFileUrl(video.videoUrl);
  const [playbackError, setPlaybackError] = useState<string | null>(
    null
  );

  return (
    <article className="card-surface overflow-hidden">
      <div
        className="relative flex w-full items-center justify-center bg-black"
        style={{ minHeight: "320px", height: "min(60vh, 480px)" }}
      >
        {videoSrc && !playbackError ? (
          <video
            controls
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              display: "block",
            }}
            poster={getFileUrl(video.thumbnailUrl) || undefined}
            onError={(e) => {
              const mediaError = e.currentTarget.error;
              console.error("Video playback error:", mediaError);

              setPlaybackError(
                mediaError?.message ||
                  "La lecture de cette vidéo a échoué (format non supporté ou fichier introuvable)."
              );
            }}
          >
            <source src={videoSrc} type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 text-center text-white/60">
            <PlayCircle size={48} />
            <span className="font-body text-sm">
              {playbackError || "Vidéo indisponible"}
            </span>
          </div>
        )}
      </div>

      <div className="p-7">
        <div className="mb-3 flex items-center gap-2">
          {video.category && (
            <span className="rounded-full bg-[#ffe3ee] px-3 py-1 font-body text-[11px] font-semibold text-[#7a1352]">
              {video.category}
            </span>
          )}

          {video.durationSeconds && (
            <span className="inline-flex items-center gap-1 font-body text-xs text-[#1e1620]/50">
              <Clock size={12} />
              {formatDuration(video.durationSeconds)}
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
      </div>
    </article>
  );
}

function ResourceView({ resource }: { resource: ResourceLesson }) {
  const fileHref = getFileUrl(resource.fileUrl);

  return (
    <article className="card-surface p-7">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffe3ee]">
        <FileText size={28} className="text-[#e0156a]" />
      </div>

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
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] px-5 py-2.5 font-body text-sm font-semibold text-white hover:brightness-105"
        >
          <Download size={16} />
          Télécharger la ressource
        </a>
      ) : (
        <p className="font-body text-sm text-[#1e1620]/50">
          Fichier indisponible.
        </p>
      )}
    </article>
  );
}