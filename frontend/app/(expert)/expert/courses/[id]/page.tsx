"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  File,
  FileText,
  Pencil,
  Plus,
  PlayCircle,
  Star,
  Users,
  Video as VideoIcon,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationMinutes: number;
  enrolledCount: number;
  rating: number;
  coverUrl?: string | null;
  isPublished: boolean;
};

type Article = {
  id: string;
  title: string;
  category?: string;
  coverUrl?: string | null;
  isPublished?: boolean;
};

type Video = {
  id: string;
  title: string;
  category?: string;
  thumbnailUrl?: string | null;
  isPublished?: boolean;
};

type Resource = {
  id: string;
  title: string;
  type?: string;
  coverUrl?: string | null;
  isPublished?: boolean;
};

type ApiResponse<T> = { data?: T; message?: string };

function getFileUrl(url?: string | null) {
  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) return `${BACKEND_URL}${url}`;

  return `${BACKEND_URL}/${url}`;
}

function formatDuration(minutes: number) {
  if (!minutes || minutes <= 0) return "Non renseignée";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining === 0 ? `${hours} h` : `${hours} h ${remaining} min`;
}

/* ============================================================
   COVER PLACEHOLDER — small tile version for previews
============================================================ */

const PALETTES = [
  "from-wine-400 to-wine-600",
  "from-rose-300 to-wine-600",
  "from-amber-300 to-orange-500",
  "from-teal-400 to-cyan-600",
  "from-indigo-400 to-wine-700",
];

function pickPalette(title: string) {
  const index =
    title.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0) %
    PALETTES.length;
  return PALETTES[index];
}

function MiniCover({
  title,
  icon,
  imageUrl,
}: {
  title: string;
  icon: React.ReactNode;
  imageUrl?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={title}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${pickPalette(
        title
      )}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/25 text-white backdrop-blur-sm">
        {icon}
      </div>
    </div>
  );
}

/* ============================================================
   CONTENT OVERVIEW CARD
============================================================ */

function ContentOverviewCard({
  icon,
  title,
  description,
  count,
  items,
  loading,
  manageHref,
  createHref,
  emptyLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  items: { id: string; title: string; thumb: React.ReactNode }[];
  loading: boolean;
  manageHref: string;
  createHref: string;
  emptyLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
            {icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-wine-900">
                {title}
              </h2>
              <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
                {count}
              </span>
            </div>
            <p className="text-sm text-ink-soft">{description}</p>
          </div>
        </div>

        <Link
          href={createHref}
          className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-wine-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-wine-800 sm:inline-flex"
        >
          <Plus size={15} />
          Ajouter
        </Link>
      </div>

      <div className="border-t border-sand-100 p-6">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-6 py-10 text-center text-sm text-ink-soft">
            Chargement...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">{emptyLabel}</p>

            <Link
              href={createHref}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-wine-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-wine-800"
            >
              <Plus size={15} />
              Ajouter
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-sand-200"
                >
                  <div className="h-20 w-full">{item.thumb}</div>
                  <p className="truncate p-2 text-xs font-medium text-wine-900">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={manageHref}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-sand-200 py-2.5 text-sm font-semibold text-wine-900 transition hover:bg-sand-50"
            >
              Voir tout ({count})
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const courseResponse = await fetch(`${API_URL}/courses/${id}`, {
          headers,
          cache: "no-store",
        });

        const courseJson: ApiResponse<Course> = await courseResponse.json();

        if (!courseResponse.ok) {
          throw new Error(
            courseJson.message || "Impossible de charger le cours."
          );
        }

        setCourse(courseJson.data || null);
        setLoadingContent(true);

        const [articlesRes, videosRes, resourcesRes] = await Promise.all([
          fetch(`${API_URL}/courses/${id}/articles`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/courses/${id}/videos`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/courses/${id}/resources`, {
            headers,
            cache: "no-store",
          }),
        ]);

        const articlesJson = await articlesRes.json().catch(() => ({}));
        const videosJson = await videosRes.json().catch(() => ({}));
        const resourcesJson = await resourcesRes.json().catch(() => ({}));

        setArticles(
          Array.isArray(articlesJson?.data) ? articlesJson.data : []
        );
        setVideos(Array.isArray(videosJson?.data) ? videosJson.data : []);
        setResources(
          Array.isArray(resourcesJson?.data) ? resourcesJson.data : []
        );
      } catch (err: any) {
        console.error("Erreur chargement cours:", err);
        setError(err?.message || "Impossible de récupérer le cours.");
      } finally {
        setLoading(false);
        setLoadingContent(false);
      }
    }

    loadCourse();
  }, [id, router]);

  const totalContent = useMemo(
    () => articles.length + videos.length + resources.length,
    [articles.length, videos.length, resources.length]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Cours" />
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-soft">
          Chargement du cours...
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Cours" />

        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="font-display text-xl font-semibold text-wine-900">
            Impossible de charger le cours
          </h2>
          <p className="mt-2 text-sm text-rose-600">
            {error || "Cours introuvable"}
          </p>

          <button
            onClick={() => router.push("/expert/courses")}
            className="mt-6 rounded-xl bg-wine-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-wine-800"
          >
            Retour aux cours
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <Header title={course.title} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <Link href="/expert/courses" className="transition hover:text-wine-700">
            Cours
          </Link>
          <span>/</span>
          <span className="max-w-[260px] truncate font-medium text-wine-900">
            {course.title}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/expert/courses")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
            >
              <ArrowLeft size={16} />
              Retour aux cours
            </button>

            <h1 className="font-display text-3xl font-semibold text-wine-900">
              {course.title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Gérez le contenu et les ressources pédagogiques de votre cours.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/expert/courses/${id}/edit`)}
            >
              <Pencil size={16} />
              Modifier les informations
            </Button>

            <Button
              onClick={() =>
                router.push(`/expert/courses/${id}/articles/create`)
              }
            >
              <Plus size={17} />
              Ajouter du contenu
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[280px_1fr]">
            <div className="relative min-h-[220px] bg-wine-50">
              {course.coverUrl ? (
                <img
                  src={getFileUrl(course.coverUrl) || ""}
                  alt={course.title}
                  className="h-full min-h-[220px] w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[220px] items-center justify-center bg-gradient-to-br from-wine-100 to-sand-100">
                  <BookOpen size={56} className="text-wine-300" />
                </div>
              )}
            </div>

            <div className="p-7">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge tone={course.isPublished ? "rose" : "neutral"}>
                  {course.isPublished ? "Publié" : "Brouillon"}
                </Badge>

                <span className="rounded-full bg-wine-50 px-3 py-1 text-xs font-medium text-wine-700">
                  {course.category}
                </span>

                <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-soft">
                  {course.level}
                </span>
              </div>

              <p className="max-w-3xl text-sm leading-6 text-ink-soft">
                {course.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatPill
                  icon={<Clock size={16} />}
                  label="Durée"
                  value={formatDuration(course.durationMinutes)}
                />
                <StatPill
                  icon={<Users size={16} />}
                  label="Inscrites"
                  value={String(course.enrolledCount)}
                />
                <StatPill
                  icon={<Star size={16} />}
                  label="Note"
                  value={course.rating.toFixed(1)}
                />
                <StatPill
                  icon={<BookOpen size={16} />}
                  label="Éléments"
                  value={String(totalContent)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content overview grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <ContentOverviewCard
            icon={<FileText size={20} />}
            title="Articles"
            description="Leçons écrites"
            count={articles.length}
            loading={loadingContent}
            manageHref={`/expert/courses/${id}/articles`}
            createHref={`/expert/courses/${id}/articles/create`}
            emptyLabel="Aucun article pour le moment."
            items={articles.map((a) => ({
              id: a.id,
              title: a.title,
              thumb: (
                <MiniCover
                  title={a.title}
                  icon={<FileText size={20} />}
                  imageUrl={getFileUrl(a.coverUrl)}
                />
              ),
            }))}
          />

          <ContentOverviewCard
            icon={<VideoIcon size={20} />}
            title="Vidéos"
            description="Contenus vidéo"
            count={videos.length}
            loading={loadingContent}
            manageHref={`/expert/courses/${id}/videos`}
            createHref={`/expert/courses/${id}/videos/create`}
            emptyLabel="Aucune vidéo pour le moment."
            items={videos.map((v) => ({
              id: v.id,
              title: v.title,
              thumb: (
                <MiniCover
                  title={v.title}
                  icon={<PlayCircle size={20} />}
                  imageUrl={getFileUrl(v.thumbnailUrl)}
                />
              ),
            }))}
          />

          <ContentOverviewCard
            icon={<File size={20} />}
            title="Ressources"
            description="PDF et fichiers"
            count={resources.length}
            loading={loadingContent}
            manageHref={`/expert/courses/${id}/resources`}
            createHref={`/expert/courses/${id}/resources/create`}
            emptyLabel="Aucune ressource pour le moment."
            items={resources.map((r) => ({
              id: r.id,
              title: r.title,
              thumb: (
                <MiniCover
                  title={r.title}
                  icon={<File size={20} />}
                  imageUrl={getFileUrl(r.coverUrl)}
                />
              ),
            }))}
          />
        </div>

        {/* Status */}
        <div className="rounded-3xl border border-wine-100 bg-wine-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display font-semibold text-wine-900">
                {course.isPublished ? "Cours publié" : "Cours en brouillon"}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">
                {course.isPublished
                  ? "Les entrepreneures peuvent accéder à ce cours."
                  : "Ajoutez du contenu puis publiez votre cours."}
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => router.push(`/expert/courses/${id}/edit`)}
            >
              Modifier le cours
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   STAT PILL
============================================================ */

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3.5">
      <div className="flex items-center gap-2 text-wine-700">
        {icon}
        <span className="text-xs font-medium text-ink-soft">{label}</span>
      </div>
      <p className="mt-1.5 text-base font-semibold text-wine-900">{value}</p>
    </div>
  );
}