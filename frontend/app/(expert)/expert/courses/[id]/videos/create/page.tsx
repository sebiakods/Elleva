"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Film, Loader2, Upload, X } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

// IMPORTANT: always use the relative "/api" path so requests stay
// same-origin with the frontend and the Next.js rewrite proxies them
// to the real backend. Using the full onrender.com URL directly here
// (like other pages in this app do via NEXT_PUBLIC_API_URL) turns the
// request cross-site and the HttpOnly auth cookie stops being sent
// reliably — that's the root cause behind the recurring 401s.
const API_URL = "/api";

const CATEGORY_OPTIONS = [
  "business plan",
  "finance",
  "marketing",
  "juridique",
  "gestion",
  "autre",
];

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 Ko";
  const units = ["o", "Ko", "Mo", "Go"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/**
 * Reads a local video File and resolves its duration in seconds
 * using a throwaway <video> element + object URL. This lets us send
 * durationSeconds to the backend without asking the user to type it
 * in manually (the Video model requires it).
 */
function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.round(video.duration) || 0);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de lire ce fichier vidéo."));
    };
  });
}

export default function CreateVideoPage() {
  const params = useParams();
  const router = useRouter();

  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [isPublished, setIsPublished] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const [detectingDuration, setDetectingDuration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVideoSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setVideoFile(file);
    setVideoDuration(null);

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Merci de sélectionner un fichier vidéo valide.");
      setVideoFile(null);
      return;
    }

    try {
      setDetectingDuration(true);
      const duration = await readVideoDuration(file);
      setVideoDuration(duration);
    } catch {
      // Duration detection is best-effort; the backend can still
      // recompute it server-side if this comes back as 0.
      setVideoDuration(0);
    } finally {
      setDetectingDuration(false);
    }
  }

  function formatDuration(seconds: number | null): string {
    if (seconds === null) return "";
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${String(remaining).padStart(2, "0")}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    if (!description.trim()) {
      setError("La description est obligatoire.");
      return;
    }

    if (!videoFile) {
      setError("Merci de sélectionner un fichier vidéo.");
      return;
    }

    try {
      setSubmitting(true);

      // IMPORTANT: the backend route uses
      // upload.single("videoFile"), which only accepts ONE file field
      // named exactly "videoFile" — any other field name (or a second
      // file field like "thumbnail") triggers multer's
      // "Unexpected field" error and a 500. Until the backend route
      // is upgraded to upload.fields([...]) to accept a thumbnail too,
      // only the video file is sent here.
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("isPublished", String(isPublished));
      formData.append("durationSeconds", String(videoDuration ?? 0));
      formData.append("videoFile", videoFile);

      const response = await fetch(
        `${API_URL}/courses/${encodeURIComponent(courseId)}/videos`,
        {
          method: "POST",
          credentials: "include",
          body: formData, // do NOT set Content-Type manually — the
          // browser needs to set the multipart boundary itself
        }
      );

      if (response.status === 401 || response.status === 403) {
        router.push("/login");
        return;
      }

      const json = (await response.json().catch(() => null)) as
        | ApiResponse<unknown>
        | null;

      if (!response.ok) {
        throw new Error(
          json?.message || "Impossible de créer la vidéo."
        );
      }

      router.push(`/expert/courses/${encodeURIComponent(courseId)}/videos`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'envoi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <Header title="Ajouter une vidéo" />

      <div className="mx-auto max-w-3xl px-6 py-8">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/expert/courses/${encodeURIComponent(courseId)}/videos`
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
        >
          <ArrowLeft size={17} />
          Retour aux vidéos
        </button>

        <h1 className="mb-6 font-display text-2xl font-semibold text-wine-900">
          Ajouter une vidéo
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-sand-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-wine-900">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Les 5 erreurs à éviter dans un Business Plan"
              className="w-full rounded-xl border border-sand-200 px-4 py-2.5 text-sm focus:border-wine-400 focus:outline-none focus:ring-2 focus:ring-wine-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-wine-900">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Décrivez ce que les entrepreneures vont apprendre dans cette vidéo."
              className="w-full rounded-xl border border-sand-200 px-4 py-2.5 text-sm focus:border-wine-400 focus:outline-none focus:ring-2 focus:ring-wine-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-wine-900">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-sand-200 px-4 py-2.5 text-sm focus:border-wine-400 focus:outline-none focus:ring-2 focus:ring-wine-100"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-sand-300 text-wine-700 focus:ring-wine-400"
                />
                Publier immédiatement
              </label>
            </div>
          </div>

          {/* Video file */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-wine-900">
              Fichier vidéo
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />

            {videoFile ? (
              <div className="flex items-center justify-between rounded-xl border border-sand-200 bg-sand-50 px-4 py-3">
                <div className="flex items-center gap-3 text-sm">
                  <Film size={18} className="text-wine-700" />
                  <div>
                    <p className="font-medium text-wine-900">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {formatBytes(videoFile.size)}
                      {detectingDuration && " · lecture de la durée..."}
                      {!detectingDuration &&
                        videoDuration !== null &&
                        ` · ${formatDuration(videoDuration)}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoDuration(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="rounded-lg p-1.5 text-ink-soft transition hover:bg-red-50 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sand-300 bg-sand-50 px-4 py-6 text-sm font-medium text-ink-soft transition hover:bg-sand-100"
              >
                <Upload size={17} />
                Choisir un fichier vidéo
              </button>
            )}
          </div>

          {/*
            Thumbnail upload removed for now: the backend route only
            accepts a single "videoFile" field
            (upload.single("videoFile")), so a second file here would
            trigger multer's "Unexpected field" error again. Re-add
            this once the /:id/videos POST route is upgraded to
            upload.fields([{name:"videoFile"},{name:"thumbnail"}]).
          */}

          <div className="flex items-center justify-end gap-3 border-t border-sand-100 pt-6">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${encodeURIComponent(courseId)}/videos`
                )
              }
              className="rounded-xl border border-sand-200 px-5 py-2.5 text-sm font-semibold text-wine-900 transition hover:bg-sand-50"
            >
              Annuler
            </button>

<Button
  type="submit"
  variant="primary"
  onClick={() => {
    if (submitting) return;
  }}
>
  {submitting ? (
    <>
      <Loader2 size={17} className="animate-spin" />
      Envoi en cours...
    </>
  ) : (
    "Publier la vidéo"
  )}
</Button>
          </div>
        </form>
      </div>
    </main>
  );
}