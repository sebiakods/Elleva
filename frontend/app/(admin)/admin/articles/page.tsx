"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  FileText,
  Clock3,
  CheckCircle2,
  FileEdit,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTimeMinutes: number;
  createdAt: string;
  isPublished: boolean;
};

function getAuthToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

function formatDate(date: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const res = await fetch(`${API_URL}/articles/all`, {
        headers: {
          Accept: "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Impossible de charger les articles.");
      }

      const data = await res.json();

      setArticles(
        Array.isArray(data)
          ? data
          : data.data ?? data.articles ?? []
      );
    } catch (error) {
      console.error("FETCH ARTICLES ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les articles."
      );

      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cet article ?"
    );

    if (!confirmed) return;

    try {
      const token = getAuthToken();

      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Erreur lors de la suppression."
        );
      }

      setArticles((prev) =>
        prev.filter((article) => article.id !== id)
      );
    } catch (error) {
      console.error("DELETE ARTICLE ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'article."
      );
    }
  }

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return articles;

    return articles.filter((article) => {
      return (
        article.title?.toLowerCase().includes(query) ||
        article.category?.toLowerCase().includes(query) ||
        article.slug?.toLowerCase().includes(query)
      );
    });
  }, [articles, search]);

  const stats = useMemo(
    () => ({
      total: articles.length,

      published: articles.filter(
        (article) => article.isPublished
      ).length,

      drafts: articles.filter(
        (article) => !article.isPublished
      ).length,

      averageReadTime:
        articles.length > 0
          ? Math.round(
              articles.reduce(
                (sum, article) =>
                  sum + (article.readTimeMinutes || 0),
                0
              ) / articles.length
            )
          : 0,
    }),
    [articles]
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden p-5 sm:p-6 lg:p-8">
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}
      <div className="mb-7 text-sm text-ink-soft">
        <span>Espace Admin</span>

        <span className="mx-2 text-ink-soft/40">/</span>

        <span className="font-medium text-wine-700">
          Gestion des articles
        </span>
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}
      <div className="relative mb-8">
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute
            -top-14
            right-0
            -z-10
            h-48
            w-48
            rounded-full
            bg-rise-gradient-soft
            opacity-60
            blur-3xl
            md:h-64
            md:w-64
          "
        />

        <p className="font-script text-2xl leading-none text-rose-500">
          Administration,
        </p>

        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          Gestion des{" "}
          <span className="text-gradient-rise">articles</span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Consultez, créez et gérez les articles publiés
          sur la plateforme Ellevadz.
        </p>
      </div>

      {/* =====================================================
          SEARCH + CREATE
      ====================================================== */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="
            flex
            w-full
            max-w-sm
            items-center
            gap-2.5
            rounded-xl
            border
            border-sand-200
            bg-white
            px-3.5
            py-2.5
            shadow-sm
            transition-all
            focus-within:border-rose-300
            focus-within:shadow-card
          "
        >
          <Search
            size={17}
            className="shrink-0 text-ink-soft"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="
              w-full
              bg-transparent
              text-sm
              text-ink
              outline-none
              placeholder:text-ink-soft/60
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="
                shrink-0
                rounded-full
                p-1
                text-ink-soft
                transition-colors
                hover:bg-sand-100
                hover:text-ink
              "
              aria-label="Effacer la recherche"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="whitespace-nowrap text-sm text-ink-soft">
            {filteredArticles.length} article
            {filteredArticles.length !== 1 ? "s" : ""} affiché
            {filteredArticles.length !== 1 ? "s" : ""}
          </p>

          <button
            type="button"
            onClick={() => router.push("/admin/articles/new")}
            className="
              inline-flex
              shrink-0
              items-center
              gap-2
              rounded-lg
              bg-rise-gradient
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:brightness-105
              hover:shadow-card
            "
          >
            <FileText size={15} />
            Nouvel article
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-3
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            px-4
            py-3
            text-sm
            text-rose-700
          "
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="
              shrink-0
              rounded-full
              p-1
              transition-colors
              hover:bg-rose-100
            "
            aria-label="Fermer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =====================================================
          STATS
      ====================================================== */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}
        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Total articles
              </p>

              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading ? "…" : stats.total}
              </p>

              <p className="mt-1 text-xs text-ink-soft">
                Tous les articles
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <FileText
                size={18}
                className="text-rose-500"
              />
            </div>
          </div>
        </div>

        {/* PUBLISHED */}
        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Publiés
              </p>

              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading ? "…" : stats.published}
              </p>

              <p className="mt-1 text-xs text-ink-soft">
                Articles visibles
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wine-50">
              <CheckCircle2
                size={18}
                className="text-wine-700"
              />
            </div>
          </div>
        </div>

        {/* DRAFTS */}
        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Brouillons
              </p>

              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading ? "…" : stats.drafts}
              </p>

              <p className="mt-1 text-xs text-ink-soft">
                Articles non publiés
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <FileEdit
                size={18}
                className="text-amber-600"
              />
            </div>
          </div>
        </div>

        {/* READ TIME */}
        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Temps moyen
              </p>

              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading
                  ? "…"
                  : `${stats.averageReadTime} min`}
              </p>

              <p className="mt-1 text-xs text-ink-soft">
                Temps de lecture
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <Clock3
                size={18}
                className="text-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}
      <div className="card-surface w-full max-w-full overflow-hidden shadow-card">
        {/* TABLE HEADER */}
        <div className="flex flex-col gap-2 border-b border-sand-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Articles
            </h2>

            <p className="mt-1 text-xs text-ink-soft">
              Liste des articles disponibles sur la plateforme.
            </p>
          </div>

          <p className="text-xs text-ink-soft">
            {filteredArticles.length} résultat
            {filteredArticles.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <table
            className="
              w-full
              min-w-[760px]
              table-fixed
              text-sm
            "
          >
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-sand-100 bg-sand-50/70">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Article
                </th>

                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Catégorie
                </th>

                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Lecture
                </th>

                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Date
                </th>

                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Statut
                </th>

                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="
                          mb-3
                          h-8
                          w-8
                          animate-spin
                          rounded-full
                          border-2
                          border-sand-200
                          border-t-rose-500
                        "
                      />

                      <p className="text-sm text-ink-soft">
                        Chargement des articles...
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* ARTICLES */}
              {!loading &&
                filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="
                      group
                      border-b
                      border-sand-100
                      last:border-b-0
                      transition-colors
                      hover:bg-rose-50/30
                    "
                  >
                    {/* ARTICLE */}
                    <td className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-rise-gradient
                            text-white
                            shadow-sm
                          "
                        >
                          <FileText size={15} />
                        </div>

                        <div className="min-w-0">
                          <p
                            title={article.title}
                            className="truncate text-sm font-medium text-ink"
                          >
                            {article.title}
                          </p>

                          <p
                            title={article.slug}
                            className="mt-0.5 truncate text-xs text-ink-soft"
                          >
                            /{article.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-4">
                      <div className="whitespace-nowrap">
                        <Badge tone="rose">
                          {article.category}
                        </Badge>
                      </div>
                    </td>

                    {/* READ TIME */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-soft">
                        <Clock3 size={13} />
                        <span>
                          {article.readTimeMinutes} min
                        </span>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-4 text-xs text-ink-soft">
                      <span className="whitespace-nowrap">
                        {formatDate(article.createdAt)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <div className="whitespace-nowrap">
                        <Badge
                          tone={
                            article.isPublished
                              ? "wine"
                              : "gold"
                          }
                        >
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />

                          {article.isPublished
                            ? "Publié"
                            : "Brouillon"}
                        </Badge>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {/* VIEW */}
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/articles/${article.id}`
                            )
                          }
                          className="
                            inline-flex
                            h-8
                            shrink-0
                            items-center
                            justify-center
                            gap-1.5
                            rounded-lg
                            border
                            border-sand-200
                            bg-white
                            px-2.5
                            text-xs
                            font-medium
                            text-ink
                            transition-all
                            hover:border-rose-200
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                          title="Voir l'article"
                        >
                          <Eye size={14} />

                          <span className="hidden lg:inline">
                            Voir
                          </span>
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(article.id)
                          }
                          className="
                            inline-flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-rose-100
                            bg-white
                            text-rose-500
                            transition-all
                            hover:bg-rose-50
                            hover:text-rose-700
                          "
                          aria-label="Supprimer l'article"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* EMPTY */}
              {!loading &&
                filteredArticles.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-14 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sand-50">
                          <Search
                            size={21}
                            className="text-ink-soft"
                          />
                        </div>

                        <p className="text-sm font-medium text-ink">
                          Aucun article trouvé
                        </p>

                        <p className="mt-1 text-xs leading-5 text-ink-soft">
                          {search
                            ? "Essayez avec un autre terme de recherche."
                            : "Aucun article n'est disponible pour le moment."}
                        </p>

                        {search && (
                          <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="mt-3 text-xs font-medium text-rose-600 hover:text-rose-700"
                          >
                            Effacer la recherche
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}