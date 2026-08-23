"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Film,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

const API_URL = '/api';

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

type Video = {
  id: string;
  title: string;
  description?: string | null;
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  isPublished?: boolean;
  views?: number | null;
};

type Course = {
  id: string;
  title: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getFileUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  const value = url.trim();

  if (!value) {
    return null;
  }

  // Already an absolute URL or browser blob URL.
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  // Backend-relative path.
  if (value.startsWith("/")) {
    return `${BACKEND_URL}${value}`;
  }

  return `${BACKEND_URL}/${value}`;
}

async function parseJsonResponse(response: Response): Promise<any> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function getErrorMessage(
  data: any,
  fallback: string,
  status?: number
): string {
  if (data?.message) {
    return String(data.message);
  }

  if (data?.error) {
    return String(data.error);
  }

  if (status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }

  if (status === 403) {
    return "Vous n'avez pas l'autorisation d'effectuer cette action.";
  }

  return fallback;
}

/**
 * All authenticated API requests use the httpOnly cookie.
 *
 * IMPORTANT:
 * - No localStorage
 * - No accessToken
 * - No Authorization header
 * - The browser automatically sends the session cookie.
 */
async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const videoId =
    typeof params?.videoId === "string"
      ? params.videoId
      : Array.isArray(params?.videoId)
        ? params.videoId[0]
        : "";

  const [course, setCourse] = useState<Course | null>(null);
  const [video, setVideo] = useState<Video | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [isPublished, setIsPublished] = useState(false);

  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(
    null
  );

  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load course + video                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!courseId || !videoId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);

        const [courseRes, videoRes] = await Promise.all([
          authenticatedFetch(
            `${API_URL}/courses/${encodeURIComponent(courseId)}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              cache: "no-store",
            }
          ),

          authenticatedFetch(
            `${API_URL}/courses/${encodeURIComponent(
              courseId
            )}/videos/${encodeURIComponent(videoId)}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              cache: "no-store",
            }
          ),
        ]);

        const courseJson = await parseJsonResponse(courseRes);
        const videoJson = await parseJsonResponse(videoRes);

        if (!courseRes.ok) {
          if (courseRes.status === 401) {
            router.push("/login");
            return;
          }

          throw new Error(
            getErrorMessage(
              courseJson,
              "Impossible de charger le cours.",
              courseRes.status
            )
          );
        }

        if (!videoRes.ok) {
          if (videoRes.status === 401) {
            router.push("/login");
            return;
          }

          throw new Error(
            getErrorMessage(
              videoJson,
              "Impossible de charger la vidéo.",
              videoRes.status
            )
          );
        }

        if (cancelled) {
          return;
        }

        const courseData: Course =
          courseJson?.data ?? courseJson;

        const videoData: Video =
          videoJson?.data ?? videoJson;

        setCourse(courseData);
        setVideo(videoData);

        setTitle(videoData.title ?? "");
        setDescription(videoData.description ?? "");
        setCategory(videoData.category ?? "");
        setDurationSeconds(videoData.durationSeconds ?? 0);

        setThumbnailUrl(videoData.thumbnailUrl ?? "");

        setIsPublished(Boolean(videoData.isPublished));

        setExistingVideoUrl(videoData.videoUrl ?? null);

        /*
         * If the existing video URL is an external URL, display it
         * in the URL field. Otherwise leave it empty.
         */
        const currentVideoUrl = videoData.videoUrl ?? "";

        if (
          currentVideoUrl.startsWith("http://") ||
          currentVideoUrl.startsWith("https://")
        ) {
          setVideoUrl(currentVideoUrl);
        } else {
          setVideoUrl("");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("VIDEO LOAD ERROR:", error);

        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("Impossible de charger la vidéo.");
        }

        setCourse(null);
        setVideo(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [courseId, videoId, router]);

  /* ------------------------------------------------------------------------ */
  /* Video file                                                               */
  /* ------------------------------------------------------------------------ */

  function handleVideoFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Formats acceptés : MP4, WebM, MOV.");
      e.target.value = "";
      return;
    }

    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Le fichier vidéo ne doit pas dépasser 100 MB.");
      e.target.value = "";
      return;
    }

    setNewVideoFile(file);

    /*
     * If the user selected a new file, don't accidentally submit
     * an old external URL as well.
     */
    setVideoUrl("");
  }

  function removeNewVideoFile() {
    setNewVideoFile(null);

    const input = document.getElementById(
      "video-replace"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Save                                                                      */
  /* ------------------------------------------------------------------------ */

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) {
      return;
    }

    if (!title.trim()) {
      alert("Veuillez renseigner le titre de la vidéo.");
      return;
    }

    if (!courseId || !videoId) {
      alert("Identifiant du cours ou de la vidéo introuvable.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category.trim());

      formData.append(
        "durationSeconds",
        String(Math.max(0, Number(durationSeconds) || 0))
      );

      formData.append(
        "isPublished",
        String(isPublished)
      );

      if (thumbnailUrl.trim()) {
        formData.append(
          "thumbnailUrl",
          thumbnailUrl.trim()
        );
      }

      /*
       * Backend route:
       *
       * upload.single("videoFile")
       *
       * Therefore the field MUST be "videoFile".
       */
      if (newVideoFile) {
        formData.append("videoFile", newVideoFile);
      } else if (videoUrl.trim()) {
        formData.append("videoUrl", videoUrl.trim());
      }

      const response = await authenticatedFetch(
        `${API_URL}/courses/${encodeURIComponent(
          courseId
        )}/videos/${encodeURIComponent(videoId)}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        throw new Error(
          getErrorMessage(
            data,
            "Impossible de mettre à jour la vidéo.",
            response.status
          )
        );
      }

      alert("Vidéo mise à jour avec succès.");

      router.push(
        `/expert/courses/${encodeURIComponent(courseId)}/videos`
      );

      router.refresh();
    } catch (error) {
      console.error("UPDATE VIDEO ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                    */
  /* ------------------------------------------------------------------------ */

  async function handleDelete() {
    if (deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette vidéo ? Cette action est irréversible."
    );

    if (!confirmed) {
      return;
    }

    if (!courseId || !videoId) {
      alert("Identifiant du cours ou de la vidéo introuvable.");
      return;
    }

    try {
      setDeleting(true);

      const response = await authenticatedFetch(
        `${API_URL}/courses/${encodeURIComponent(
          courseId
        )}/videos/${encodeURIComponent(videoId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        throw new Error(
          getErrorMessage(
            data,
            "Impossible de supprimer la vidéo.",
            response.status
          )
        );
      }

      router.push(
        `/expert/courses/${encodeURIComponent(courseId)}/videos`
      );

      router.refresh();
    } catch (error) {
      console.error("DELETE VIDEO ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                   */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Vidéo" />

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <Loader2
              size={20}
              className="animate-spin text-wine-700"
            />

            Chargement de la vidéo...
          </div>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Not found                                                                 */
  /* ------------------------------------------------------------------------ */

  if (!course || !video) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Vidéo" />

        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <Film
            size={42}
            className="mx-auto mb-4 text-ink-soft/50"
          />

          <h1 className="font-display text-2xl font-semibold text-wine-900">
            Vidéo introuvable
          </h1>

          <p className="mt-2 text-sm text-ink-soft">
            La vidéo demandée n'existe pas ou n'est plus
            disponible.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/expert/courses/${encodeURIComponent(courseId)}`
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
          >
            <ArrowLeft size={17} />

            Retour au cours
          </button>
        </div>
      </main>
    );
  }

  const existingVideo = getFileUrl(existingVideoUrl);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-sand-50">
      <Header title="Modifier la vidéo" />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Breadcrumb */}

        <div className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <span>Cours</span>

          <span>/</span>

          <span className="max-w-[220px] truncate">
            {course.title}
          </span>

          <span>/</span>

          <span className="font-medium text-wine-900">
            Vidéo
          </span>
        </div>

        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${encodeURIComponent(
                    courseId
                  )}/videos`
                )
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
            >
              <ArrowLeft size={17} />

              Retour aux vidéos
            </button>

            <h1 className="font-display text-3xl font-semibold text-wine-900">
              Modifier la vidéo
            </h1>

            <p className="mt-2 text-sm text-ink-soft">
              Cours :{" "}
              <span className="font-medium text-wine-900">
                {course.title}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="grid gap-8 lg:grid-cols-[1fr_320px]"
        >
          {/* Main form */}

          <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
                <Film size={20} />
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-wine-900">
                  Informations de la vidéo
                </h2>

                <p className="text-sm text-ink-soft">
                  Modifiez les détails de cette vidéo.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Title */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-wine-900">
                  Titre de la vidéo
                  <span className="ml-1 text-rose-600">
                    *
                  </span>
                </label>

                <input
                  required
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                />
              </div>

              {/* Description */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-wine-900">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                />
              </div>

              {/* Category + Duration */}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-wine-900">
                    Catégorie
                  </label>

                  <input
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-wine-900">
                    Durée (secondes)
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={durationSeconds}
                    onChange={(e) =>
                      setDurationSeconds(
                        Math.max(
                          0,
                          Number(e.target.value) || 0
                        )
                      )
                    }
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                  />
                </div>
              </div>

              {/* Existing video */}

              {existingVideo && !newVideoFile && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-wine-900">
                    Vidéo actuelle
                  </label>

                  <div className="flex items-center justify-between rounded-2xl border border-sand-200 bg-sand-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-wine-900 text-white">
                        <Film size={20} />
                      </div>

                      <p className="text-sm font-medium text-wine-900">
                        Fichier vidéo joint
                      </p>
                    </div>

                    <a
                      href={existingVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2 text-xs font-semibold text-wine-900 transition hover:bg-sand-100"
                    >
                      <ExternalLink size={14} />
                      Voir
                    </a>
                  </div>
                </div>
              )}

              {/* External URL */}

              {!newVideoFile && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-wine-900">
                    URL externe de la vidéo
                  </label>

                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) =>
                      setVideoUrl(e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                  />
                </div>
              )}

              {/* Replace video file */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-wine-900">
                  Remplacer le fichier vidéo
                </label>

                {!newVideoFile ? (
                  <label
                    htmlFor="video-replace"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 px-6 py-8 text-center transition hover:border-wine-300 hover:bg-wine-50/30"
                  >
                    <Upload
                      size={24}
                      className="mb-3 text-wine-700"
                    />

                    <p className="text-sm font-semibold text-wine-900">
                      Cliquez pour sélectionner une
                      nouvelle vidéo
                    </p>

                    <p className="mt-1 text-xs text-ink-soft">
                      MP4, WebM, MOV — 100 MB maximum
                    </p>

                    <input
                      id="video-replace"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-wine-200 bg-wine-50 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wine-900 text-white">
                        <Film size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-wine-900">
                          {newVideoFile.name}
                        </p>

                        <p className="mt-1 text-xs text-ink-soft">
                          {(
                            newVideoFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeNewVideoFile}
                      className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-white hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnail URL */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-wine-900">
                  Image de couverture (miniature)
                </label>

                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) =>
                    setThumbnailUrl(e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                />
              </div>

              {/* Published toggle */}

              <div className="flex items-center justify-between rounded-2xl bg-sand-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-wine-900">
                    Publié
                  </p>

                  <p className="mt-1 text-xs text-ink-soft">
                    La vidéo sera visible par les
                    apprenantes.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) =>
                    setIsPublished(e.target.checked)
                  }
                  className="h-5 w-5 accent-wine-700"
                />
              </div>
            </div>

            {/* Actions */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving || deleting}
                onClick={() =>
                  router.push(
                    `/expert/courses/${encodeURIComponent(courseId)}/videos`
                  )
                }
                className="inline-flex items-center justify-center rounded-xl border border-sand-200 bg-white px-5 py-3 text-sm font-semibold text-wine-900 transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </button>
            </div>
          </section>

          {/* Side info */}

          <aside className="space-y-6">
            <section className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-wine-900">
                Statistiques
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">
                    Vues
                  </span>

                  <span className="font-medium text-wine-900">
                    {video.views ?? 0}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}