"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Film,
  Link as LinkIcon,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateVideoPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const [saving, setSaving] = useState(false);

  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setVideoFile(null);
      return;
    }

    const allowed = ["video/mp4", "video/webm", "video/quicktime"];

    if (!allowed.includes(file.type)) {
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

    setVideoFile(file);
  }

  function removeVideoFile() {
    setVideoFile(null);

    const input = document.getElementById(
      "video-upload"
    ) as HTMLInputElement | null;

    if (input) input.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Veuillez renseigner le titre de la vidéo.");
      return;
    }

    if (!videoFile && !videoUrl.trim()) {
      alert("Ajoutez un fichier vidéo ou une URL externe.");
      return;
    }

    if (!API_URL) {
      alert("L'URL de l'API n'est pas configurée.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        router.push("/login");
        return;
      }

      /*
       * IMPORTANT:
       * Backend route uses upload.single("videoFile")
       * Field name MUST be "videoFile".
       */
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category.trim());
      formData.append("durationSeconds", String(Number(durationSeconds) || 0));
      formData.append("isPublished", String(isPublished));

      if (videoFile) {
        formData.append("videoFile", videoFile);
      } else if (videoUrl.trim()) {
        formData.append("videoUrl", videoUrl.trim());
      }

      if (thumbnailUrl.trim()) {
        formData.append("thumbnailUrl", thumbnailUrl.trim());
      }

      const res = await fetch(`${API_URL}/courses/${courseId}/videos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let json: any = null;

      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        throw new Error(
          json?.message || "Impossible de créer la vidéo."
        );
      }

      router.push(`/expert/courses/${courseId}/videos`);
    } catch (error) {
      console.error("Create video error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <Header title="Ajouter une vidéo" />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <span>Cours</span>
          <span>/</span>
          <span>Vidéos</span>
          <span>/</span>
          <span className="font-medium text-wine-900">Ajouter</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push(`/expert/courses/${courseId}/videos`)
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
          >
            <ArrowLeft size={17} />
            Retour aux vidéos
          </button>

          <h1 className="font-display text-3xl font-semibold text-wine-900">
            Ajouter une vidéo
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Importez un fichier vidéo ou reliez une vidéo hébergée
            ailleurs (YouTube, Vimeo...).
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
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
                  Décrivez la vidéo que vous souhaitez ajouter.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-wine-900">
                  Titre de la vidéo
                  <span className="ml-1 text-rose-600">*</span>
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Les 5 erreurs d'un business plan"
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
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez le contenu de cette vidéo..."
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
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex. Business Plan"
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
                      setDurationSeconds(Number(e.target.value))
                    }
                    placeholder="Ex. 300"
                    className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                  />
                </div>
              </div>

              {/* External URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-wine-900">
                  URL de la vidéo
                </label>

                <div className="relative">
                  <LinkIcon
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/60"
                  />

                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    disabled={Boolean(videoFile)}
                    className="w-full rounded-xl border border-sand-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100 disabled:cursor-not-allowed disabled:bg-sand-50"
                  />
                </div>

                <p className="text-xs text-ink-soft">
                  Utilisez ceci OU importez un fichier vidéo ci-dessous,
                  pas les deux.
                </p>
              </div>

              <div className="text-center text-xs font-medium text-ink-soft">
                OU
              </div>

              {/* Video file */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-wine-900">
                  Fichier vidéo
                </label>

                {!videoFile ? (
                  <label
                    htmlFor="video-upload"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition ${
                      videoUrl.trim()
                        ? "cursor-not-allowed border-sand-200 bg-sand-50 opacity-50"
                        : "border-sand-300 bg-sand-50 hover:border-wine-300 hover:bg-wine-50/30"
                    }`}
                  >
                    <Upload size={28} className="mb-3 text-wine-700" />

                    <p className="text-sm font-semibold text-wine-900">
                      Importer un fichier vidéo
                    </p>

                    <p className="mt-1 text-xs text-ink-soft">
                      MP4, WebM, MOV — 100 MB maximum
                    </p>

                    <input
                      id="video-upload"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileChange}
                      disabled={Boolean(videoUrl.trim())}
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
                          {videoFile.name}
                        </p>
                        <p className="mt-1 text-xs text-ink-soft">
                          {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeVideoFile}
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
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-100"
                />
              </div>

              {/* Publication */}
              <div className="flex items-center justify-between rounded-2xl bg-sand-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-wine-900">
                    Publier immédiatement
                  </p>

                  <p className="mt-1 text-xs text-ink-soft">
                    La vidéo sera visible dans le cours.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-5 w-5 accent-wine-700"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(`/expert/courses/${courseId}/videos`)
                }
              >
                Annuler
              </Button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {saving ? "Enregistrement..." : "Créer la vidéo"}
              </button>
            </div>
          </section>

          {/* Side preview */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-wine-900">Aperçu</h2>

              <div className="mt-5 overflow-hidden rounded-2xl border border-sand-200">
                <div className="flex h-32 items-center justify-center bg-wine-50 text-wine-700">
                  <Film size={38} />
                </div>

                <div className="p-4">
                  <span className="rounded-md bg-wine-50 px-2 py-1 text-[11px] font-semibold text-wine-700">
                    {category || "Vidéo"}
                  </span>

                  <h3 className="mt-3 break-words font-semibold text-wine-900">
                    {title || "Titre de la vidéo"}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-ink-soft">
                    {description ||
                      "La description de votre vidéo apparaîtra ici."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-wine-900 p-5 text-white shadow-bloom">
              <h2 className="font-display text-lg font-semibold">Conseil</h2>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Une durée entre 3 et 10 minutes garde l'attention de
                vos apprenantes plus efficacement.
              </p>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}