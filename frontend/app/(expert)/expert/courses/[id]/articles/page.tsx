"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Eye,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

type Article = {
  id: string;
  slug?: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  coverUrl?: string | null;
  pdfUrl?: string | null;
  readTimeMinutes?: number;
  views?: number;
  isPublished?: boolean;
  order?: number;
};

type Course = {
  id: string;
  title: string;
};

function getFileUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

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

export default function CourseArticlesPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    loadData();
  }, [courseId]);

  async function loadData() {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      const [courseResponse, articlesResponse] = await Promise.all([
        fetch(`${API_URL}/courses/${courseId}`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/courses/${courseId}/articles`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const courseJson = await courseResponse.json();
      const articlesJson = await articlesResponse.json();

      if (!courseResponse.ok) {
        throw new Error(
          courseJson.message || "Impossible de charger le cours."
        );
      }

      if (!articlesResponse.ok) {
        throw new Error(
          articlesJson.message || "Impossible de charger les articles."
        );
      }

      setCourse(courseJson.data);

      const articlesData = Array.isArray(articlesJson.data)
        ? articlesJson.data
        : [];

      setArticles(articlesData);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(articleId: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cet article ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(articleId);

      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/courses/${courseId}/articles/${articleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.message || "Impossible de supprimer l'article."
        );
      }

      setArticles((current) =>
        current.filter((article) => article.id !== articleId)
      );
    } catch (error) {
      console.error("Delete article error:", error);

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
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <Loader2
              size={20}
              className="animate-spin text-wine-700"
            />
            Chargement des articles...
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-sand-50">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <FileText
            size={42}
            className="mx-auto mb-4 text-ink-soft/50"
          />

          <h1 className="font-display text-2xl font-semibold text-wine-900">
            Cours introuvable
          </h1>

          <p className="mt-2 text-sm text-ink-soft">
            Le cours demandé n'existe pas ou n'est plus disponible.
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
            href={`/expert/courses/${courseId}`}
            className="max-w-[220px] truncate transition hover:text-wine-700"
          >
            {course.title}
          </Link>

          <span>/</span>

          <span className="font-medium text-wine-900">
            Articles
          </span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(`/expert/courses/${courseId}`)
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
              Gérez les leçons écrites de ce cours.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() =>
              router.push(
                `/expert/courses/${courseId}/articles/create`
              )
            }
          >
            <Plus size={17} />
            Ajouter un article
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
                {articles.length} article
                {articles.length !== 1 ? "s" : ""}
              </span>

              <button
                type="button"
                onClick={() =>
                  router.push(`/expert/courses/${courseId}`)
                }
                className="rounded-xl border border-sand-200 px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-sand-50"
              >
                Voir le cours
              </button>
            </div>
          </div>
        </section>

        {/* Empty state */}
        {articles.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-sand-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-wine-50 text-wine-700">
              <FileText size={30} />
            </div>

            <h2 className="font-display text-xl font-semibold text-wine-900">
              Aucun article
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
              Ajoutez votre première leçon écrite pour construire
              le parcours pédagogique de ce cours.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/expert/courses/${courseId}/articles/create`
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
            >
              <Plus size={17} />
              Créer le premier article
            </button>
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => {
              const pdfUrl = getFileUrl(article.pdfUrl);
              const coverUrl = getFileUrl(article.coverUrl);

              return (
                <article
                  key={article.id}
                  className="group overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Cover */}
                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-wine-50">
                    {pdfUrl ? (
                      <iframe
                        src={`${pdfUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                        title={`Aperçu PDF - ${article.title}`}
                        className="pointer-events-none absolute left-0 top-0 h-[300px] w-full border-0"
                      />
                    ) : coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-wine-700 shadow-sm">
                        <FileText size={26} />
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <Badge
                        tone={
                          article.isPublished
                            ? "rose"
                            : "neutral"
                        }
                      >
                        {article.isPublished
                          ? "Publié"
                          : "Brouillon"}
                      </Badge>
                    </div>

                    {pdfUrl && (
                      <span className="absolute right-4 top-4 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-wine-700 shadow-sm">
                        PDF
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-wine-50 px-2.5 py-1 text-[11px] font-semibold text-wine-700">
                        {article.category || "Article"}
                      </span>

                      {article.order != null &&
                        article.order > 0 && (
                          <span className="text-xs text-ink-soft">
                            #{article.order}
                          </span>
                        )}
                    </div>

                    <h2 className="line-clamp-2 font-display text-lg font-semibold text-wine-900">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {article.readTimeMinutes || 5} min
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Eye size={13} />
                        {article.views || 0} vues
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        href={`/expert/courses/${courseId}/articles/${article.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-sand-200 px-3 py-2.5 text-sm font-semibold text-wine-900 transition hover:bg-sand-50"
                      >
                        Ouvrir
                      </Link>

                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700 transition hover:bg-wine-100"
                          title="Ouvrir le PDF"
                          aria-label="Ouvrir le PDF"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteArticle(article.id)
                        }
                        disabled={
                          deletingId === article.id
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-soft transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Supprimer"
                        aria-label={`Supprimer ${article.title}`}
                      >
                        {deletingId === article.id ? (
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

