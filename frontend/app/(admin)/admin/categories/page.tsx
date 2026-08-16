"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Tags,
  Star,
  CheckCircle2,
  EyeOff,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  status: string;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const response = await fetch(`${API_URL}/categories`, {
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

      if (!response.ok) {
        throw new Error("Impossible de charger les catégories.");
      }

      const data = await response.json();

      setCategories(
        Array.isArray(data)
          ? data
          : data.data ?? data.categories ?? []
      );
    } catch (err) {
      console.error("FETCH CATEGORIES ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les catégories."
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette catégorie ?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = getAuthToken();

      const response = await fetch(`${API_URL}/categories/${id}`, {
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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Suppression impossible."
        );
      }

      setCategories((prev) =>
        prev.filter((category) => category.id !== id)
      );
    } catch (err) {
      console.error("DELETE CATEGORY ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cette catégorie."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) => {
      return (
        category.name?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        category.status?.toLowerCase().includes(query)
      );
    });
  }, [categories, search]);

  const stats = useMemo(
    () => ({
      total: categories.length,

      active: categories.filter(
        (category) => category.status === "active"
      ).length,

      hidden: categories.filter(
        (category) => category.status !== "active"
      ).length,

      featured: categories.filter(
        (category) => category.featured
      ).length,
    }),
    [categories]
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden p-5 sm:p-6 lg:p-8">
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}
      <div className="mb-7 text-sm text-ink-soft">
        <span>Espace Admin</span>

        <span className="mx-2 text-ink-soft/40">
          /
        </span>

        <span className="font-medium text-wine-700">
          Gestion des catégories
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
          <span className="text-gradient-rise">
            catégories
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Créez, modifiez et gérez les catégories utilisées
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
            size={16}
            className="shrink-0 text-ink-soft"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie..."
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
                rounded-full
                p-1
                text-ink-soft
                transition-colors
                hover:bg-sand-100
                hover:text-ink
              "
              aria-label="Effacer la recherche"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-xs text-ink-soft">
            {filteredCategories.length} catégorie
            {filteredCategories.length !== 1 ? "s" : ""} affichée
            {filteredCategories.length !== 1 ? "s" : ""}
          </p>

          <Link
            href="/admin/categories/new"
            className="
              inline-flex
              shrink-0
              items-center
              gap-1.5
              rounded-lg
              bg-rise-gradient
              px-3.5
              py-2
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:brightness-105
              hover:shadow-card
            "
          >
            <Plus size={14} />
            Nouvelle catégorie
          </Link>
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
              rounded-full
              p-1
              transition-colors
              hover:bg-rose-100
            "
            aria-label="Fermer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =====================================================
          STATS
      ====================================================== */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}
        <div className="card-surface p-4 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Total catégories
              </p>

              <p className="mt-1.5 font-display text-2xl font-semibold text-wine-900">
                {loading ? "…" : stats.total}
              </p>

              <p className="mt-0.5 text-[11px] text-ink-soft">
                Toutes les catégories
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
              <Tags
                size={16}
                className="text-rose-500"
              />
            </div>
          </div>
        </div>

        {/* ACTIVE */}
        <div className="card-surface p-4 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Actives
              </p>

              <p className="mt-1.5 font-display text-2xl font-semibold text-wine-900">
                {loading ? "…" : stats.active}
              </p>

              <p className="mt-0.5 text-[11px] text-ink-soft">
                Catégories visibles
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wine-50">
              <CheckCircle2
                size={16}
                className="text-wine-700"
              />
            </div>
          </div>
        </div>

        {/* HIDDEN */}
        <div className="card-surface p-4 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Masquées
              </p>

              <p className="mt-1.5 font-display text-2xl font-semibold text-wine-900">
                {loading ? "…" : stats.hidden}
              </p>

              <p className="mt-0.5 text-[11px] text-ink-soft">
                Catégories non visibles
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <EyeOff
                size={16}
                className="text-amber-600"
              />
            </div>
          </div>
        </div>

        {/* FEATURED */}
        <div className="card-surface p-4 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                À la une
              </p>

              <p className="mt-1.5 font-display text-2xl font-semibold text-wine-900">
                {loading ? "…" : stats.featured}
              </p>

              <p className="mt-0.5 text-[11px] text-ink-soft">
                Catégories mises en avant
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
              <Star
                size={16}
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
        <div className="flex flex-col gap-1.5 border-b border-sand-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">
              Catégories
            </h2>

            <p className="mt-0.5 text-[11px] text-ink-soft">
              Liste des catégories de financement de la
              plateforme.
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <table
            className="
              w-full
              min-w-[720px]
              table-fixed
              text-left
              text-xs
            "
          >
            <colgroup>
              <col className="w-[29%]" />
              <col className="w-[15%]" />
              <col className="w-[14%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[16%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-sand-100 bg-sand-50/70">
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  Catégorie
                </th>

                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  Statut
                </th>

                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  Mise en avant
                </th>

                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  Couleur
                </th>

                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  Date
                </th>

                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
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
                    className="px-3 py-10 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="
                          mb-2.5
                          h-7
                          w-7
                          animate-spin
                          rounded-full
                          border-2
                          border-sand-200
                          border-t-rose-500
                        "
                      />

                      <p className="text-xs text-ink-soft">
                        Chargement des catégories...
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* CATEGORIES */}
              {!loading &&
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="
                      group
                      border-b
                      border-sand-100
                      last:border-b-0
                      transition-colors
                      hover:bg-rose-50/30
                    "
                  >
                    {/* CATEGORY */}
                    <td className="px-3 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {/* IMAGE / COLOR */}
                        <div
                          className="
                            h-9
                            w-9
                            shrink-0
                            overflow-hidden
                            rounded-lg
                            border
                            border-sand-100
                            shadow-sm
                          "
                          style={{
                            backgroundColor:
                              category.color || "#9C0E4A",
                          }}
                        >
                          {category.image ? (
                            <img
                              src={category.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Tags
                                size={14}
                                className="text-white"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p
                            title={category.name}
                            className="truncate text-xs font-medium text-ink"
                          >
                            {category.name}
                          </p>

                          <p
                            title={category.slug}
                            className="mt-0.5 truncate text-[10px] text-ink-soft"
                          >
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-3 py-3">
                      <Badge
                        tone={
                          category.status === "active"
                            ? "wine"
                            : "neutral"
                        }
                      >
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />

                        {category.status === "active"
                          ? "Active"
                          : "Masquée"}
                      </Badge>
                    </td>

                    {/* FEATURED */}
                    <td className="px-3 py-3">
                      {category.featured ? (
                        <Badge tone="gold">
                          <Star
                            size={11}
                            className="mr-1"
                          />
                          À la une
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-ink-soft">
                          Non
                        </span>
                      )}
                    </td>

                    {/* COLOR */}
                    <td className="px-3 py-3">
                      {category.color ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-sand-200"
                            style={{
                              backgroundColor:
                                category.color,
                            }}
                          />

                          <span className="truncate text-[10px] text-ink-soft">
                            {category.color}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-soft">
                          -
                        </span>
                      )}
                    </td>

                    {/* DATE */}
                    <td className="px-3 py-3 text-[11px] text-ink-soft">
                      {formatDate(category.createdAt)}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {/* EDIT */}
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="
                            inline-flex
                            h-7
                            shrink-0
                            items-center
                            gap-1.5
                            whitespace-nowrap
                            rounded-lg
                            border
                            border-sand-200
                            bg-white
                            px-2
                            text-[10px]
                            font-medium
                            text-ink
                            transition-all
                            hover:border-rose-200
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                        >
                          <Pencil size={12} />

                          <span className="hidden lg:inline">
                            Modifier
                          </span>
                        </Link>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category.id)
                          }
                          disabled={
                            deletingId === category.id
                          }
                          className="
                            inline-flex
                            h-7
                            w-7
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
                            disabled:pointer-events-none
                            disabled:opacity-50
                          "
                          aria-label="Supprimer la catégorie"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* EMPTY */}
              {!loading &&
                filteredCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-12 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-sand-50">
                          <Search
                            size={20}
                            className="text-ink-soft"
                          />
                        </div>

                        <p className="text-sm font-medium text-ink">
                          Aucune catégorie trouvée
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-ink-soft">
                          {search
                            ? "Essayez avec un autre terme de recherche."
                            : "Aucune catégorie n'est disponible pour le moment."}
                        </p>

                        {search && (
                          <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="mt-3 text-[11px] font-medium text-rose-600 hover:text-rose-700"
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