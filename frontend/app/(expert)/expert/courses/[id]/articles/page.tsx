"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  Newspaper,
  Plus,
  Trash2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// IMPORTANT: use the relative "/api" path so requests stay same-origin
// with the frontend and the Next.js rewrite proxies them to the real
// backend. Do NOT default this to the full onrender.com URL — that
// turns every request into a cross-site request and the HttpOnly auth
// cookie stops being sent reliably.
const API_URL = '/api';

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ||
  "https://ellevadz-backend.onrender.com";

type Article = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  coverUrl?: string | null;
  isPublished?: boolean;
  views?: number | null;
  order?: number | null;
};

type Course = {
  id: string;
  title: string;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function getFileUrl(url?: string | null): string | null {
  if (!url) return null;
  const value = url.trim();
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) return `${BACKEND_URL}${value}`;
  return `${BACKEND_URL}/${value}`;
}

const PLACEHOLDER_PALETTES = [
  { bg: "from-purple-500 to-purple-700", accent: "bg-purple-400" },
  { bg: "from-rose-500 to-rose-700", accent: "bg-rose-400" },
  { bg: "from-indigo-500 to-indigo-700", accent: "bg-indigo-400" },
  { bg: "from-amber-500 to-orange-600", accent: "bg-amber-400" },
  { bg: "from-teal-500 to-cyan-700", accent: "bg-teal-400" },
];

function pickPalette(title: string) {
  const index =
    title.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
    PLACEHOLDER_PALETTES.length;
  return PLACEHOLDER_PALETTES[index];
}

function ArticleCoverPlaceholder({
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
          <Newspaper size={24} />
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          Article
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
    </div>
  );
}

export default function CourseArticlesPage() {
  const params = useParams();
  const router = useRouter();

  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [course, setCourse] = useState<Course | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData() {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = { Accept: "application/json" };

      const [courseResponse, articlesResponse] = await Promise.all([
        fetch(`${API_URL}/courses/${encodeURIComponent(courseId)}`, {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store",
        }),
        fetch(
          `${API_URL}/courses/${encodeURIComponent(courseId)}/articles`,
          { method: "GET", headers, credentials: "include", cache: "no-store" }
        ),
      ]);

      if (
        courseResponse.status === 401 ||
        courseResponse.status === 403 ||
        articlesResponse.status === 401 ||
        articlesResponse.status === 403
      ) {
        router.push("/login");
        return;
      }

      const courseJson = (await courseResponse
        .json()
        .catch(() => null)) as ApiResponse<Course> | null;

      const articlesJson = (await articlesResponse
        .json()
        .catch(() => null)) as ApiResponse<Article[]> | null;

      if (!courseResponse.ok) {
        throw new Error(courseJson?.message || "Impossible de charger le cours.");
      }
      if (!articlesResponse.ok) {
        throw new Error(
          articlesJson?.message || "Impossible de charger les articles."
        );
      }

      setCourse(courseJson?.data ?? null);
      setArticles(Array.isArray(articlesJson?.data) ? articlesJson.data : []);
    } catch (err) {
      console.error("Error loading articles:", err);
      setError(
        err instanceof Error ? err.message : "Impossible de charger les articles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function deleteArticle(articleId: string) {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer cet article ?");
    if (!confirmed) return;

    try {
      setDeletingId(articleId);

      const response = await fetch(
        `${API_URL}/courses/${encodeURIComponent(courseId)}/articles/${encodeURIComponent(articleId)}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
          credentials: "include",
          cache: "no-store",
        }
      );

      const json = (await response.json().catch(() => null)) as
        | ApiResponse<unknown>
        | null;

      if (response.status === 401 || response.status === 403) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(json?.message || "Impossible de supprimer l'article.");
      }

      setArticles((current) =>
        current.filter((article) => article.id !== articleId)
      );
    } catch (err) {
      console.error("Delete article error:", err);
      alert(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Articles" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <Loader2 size={20} className="animate-spin text-wine-700" />
            Chargement des articles...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Articles" />
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <Newspaper size={42} className="mx-auto mb-4 text-red-400" />
            <h1 className="font-display text-2xl font-semibold text-wine-900">
              Impossible de charger les articles
            </h1>
            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void loadData()}
                className="inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={() => router.push("/expert/courses")}
                className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-5 py-3 text-sm font-semibold text-wine-900 transition hover:bg-sand-50"
              >
                <ArrowLeft size={17} />
                Retour aux cours
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-sand-50">
        <Header title="Articles" />
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <Newspaper size={42} className="mx-auto mb-4 text-ink-soft/50" />
          <h1 className="font-display text-2xl font-semibold text-wine-900">
            Cours introuvable
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Le cours demandé n&apos;existe pas ou n&apos;est plus disponible.
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
      <Header title="Articles" />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <Link href="/expert/courses" className="transition hover:text-wine-700">
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
          <span className="font-medium text-wine-900">Articles</span>
        </div>

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(`/expert/courses/${encodeURIComponent(courseId)}`)
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
            >
              <ArrowLeft size={17} />
              Retour au cours
            </button>
            <h1 className="font-display text-3xl font-semibold text-wine-900">
              Articles
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Gérez les articles pédagogiques de ce cours.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() =>
              router.push(
                `/expert/courses/${encodeURIComponent(courseId)}/articles/create`
              )
            }
          >
            <Plus size={17} />
            Ajouter un article
          </Button>
        </div>

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
                {articles.length} article{articles.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() =>
                  router.push(`/expert/courses/${encodeURIComponent(courseId)}`)
                }
                className="rounded-xl border border-sand-200 px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-sand-50"
              >
                Voir le cours
              </button>
            </div>
          </div>
        </section>

        {articles.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-sand-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-wine-50 text-wine-700">
              <Newspaper size={30} />
            </div>
            <h2 className="font-display text-xl font-semibold text-wine-900">
              Aucun article
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
              Ajoutez des articles pédagogiques pour enrichir le parcours
              d&apos;apprentissage de vos entrepreneures.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${encodeURIComponent(courseId)}/articles/create`
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
            >
              <Plus size={17} />
              Ajouter le premier article
            </button>
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => {
              const coverUrl = getFileUrl(article.coverUrl);

              return (
                <article
                  key={article.id}
                  className="group overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-40 overflow-hidden bg-wine-50">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <ArticleCoverPlaceholder
                        title={article.title}
                        category={article.category}
                      />
                    )}
                    <div className="absolute left-4 top-4">
                      <Badge tone={article.isPublished ? "rose" : "neutral"}>
                        {article.isPublished ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-wine-50 px-2.5 py-1 text-[11px] font-semibold text-wine-700">
                        {article.category || "Article"}
                      </span>
                      {article.order != null && article.order > 0 ? (
                        <span className="text-xs text-ink-soft">#{article.order}</span>
                      ) : null}
                    </div>

                    <h2 className="line-clamp-2 font-display text-lg font-semibold text-wine-900">
                      {article.title}
                    </h2>

                    {article.description ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">
                        {article.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
                      <span>{article.views ?? 0} vues</span>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        href={`/expert/courses/${encodeURIComponent(courseId)}/articles/${encodeURIComponent(article.id)}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-semibold text-wine-900 transition hover:bg-sand-50"
                      >
                        Ouvrir
                      </Link>

                      {coverUrl ? (
                        <a
                          href={coverUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700 transition hover:bg-wine-100"
                          title="Voir la couverture"
                          aria-label={`Voir la couverture ${article.title}`}
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => void deleteArticle(article.id)}
                        disabled={deletingId === article.id}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-soft transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Supprimer"
                        aria-label={`Supprimer ${article.title}`}
                      >
                        {deletingId === article.id ? (
                          <Loader2 size={17} className="animate-spin" />
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