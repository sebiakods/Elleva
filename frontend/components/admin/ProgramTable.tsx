"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  Landmark,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

interface Institution {
  id?: string;
  institutionName?: string;
  city?: string;
  type?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

interface Program {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  sector?: string;
  fundingType?: string;

  amountMin?: string | number;
  amountMax?: string | number;
  currency?: string;

  openingDate?: string;
  closingDate?: string;

  region?: string;
  targetAudience?: string;

  isPublished: boolean;
  isArchived: boolean;

  institutionProfile?: Institution;

  _count?: {
    applications?: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

export function ProgramTable() {
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPrograms(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/admin/programs?page=1&pageSize=100&sort=newest`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        throw new Error(
          "Session expirée. Veuillez vous reconnecter."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Accès refusé. Vous devez être administrateur."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Erreur lors du chargement des programmes."
        );
      }

      setPrograms(result.items || []);
      setTotal(result.pagination?.total || 0);
    } catch (err) {
      console.error("ADMIN PROGRAMS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  function formatAmount(
    amount?: string | number,
    currency?: string
  ) {
    if (amount === undefined || amount === null) {
      return "-";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return `${amount} ${currency || "DZD"}`;
    }

    return `${numericAmount.toLocaleString("fr-FR")} ${
      currency || "DZD"
    }`;
  }

  function formatDate(date?: string) {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("fr-FR");
  }

  function getStatus(program: Program) {
    if (program.isArchived) {
      return {
        label: "Archivé",
        className:
          "bg-sand-100 text-ink-soft border border-sand-200",
      };
    }

    if (program.isPublished) {
      return {
        label: "Publié",
        className:
          "bg-emerald-50 text-emerald-700 border border-emerald-100",
      };
    }

    return {
      label: "Brouillon",
      className:
        "bg-amber-50 text-amber-700 border border-amber-100",
    };
  }

  async function deleteProgram(id: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce programme ?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(
        `${API_URL}/admin/programs/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Impossible de supprimer le programme."
        );
      }

      await loadPrograms(true);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredPrograms = useMemo(() => {
    if (!search.trim()) return programs;

    const query = search.trim().toLowerCase();

    return programs.filter((program) => {
      return (
        program.title?.toLowerCase().includes(query) ||
        program.institutionProfile?.institutionName
          ?.toLowerCase()
          .includes(query) ||
        program.category?.toLowerCase().includes(query)
      );
    });
  }, [programs, search]);

  /*
   * LOADING
   */
  if (loading) {
    return (
<div className="hidden w-full overflow-hidden md:block">
  <table className="w-full table-fixed text-left">
    <colgroup>
      <col className="w-[24%]" />
      <col className="w-[18%]" />
      <col className="w-[12%]" />
      <col className="w-[14%]" />
      <col className="w-[12%]" />
      <col className="w-[10%]" />
      <col className="w-[10%]" />
    </colgroup>

    <thead>
      <tr className="border-b border-sand-200 bg-sand-50">
        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Programme
        </th>

        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Institution
        </th>

        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Catégorie
        </th>

        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Montant
        </th>

        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Échéance
        </th>

        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Statut
        </th>

        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Actions
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-sand-100">
      {filteredPrograms.map((program) => {
        const status = getStatus(program);

        return (
          <tr
            key={program.id}
            className="h-[58px] transition-colors hover:bg-rose-50/20"
          >
            {/* PROGRAMME */}
            <td className="px-3 py-2.5 align-middle">
              <div className="min-w-0">
                <p
                  title={program.title}
                  className="truncate text-xs font-semibold text-ink"
                >
                  {program.title}
                </p>

                {program.shortDescription && (
                  <p
                    title={program.shortDescription}
                    className="mt-0.5 truncate text-[10px] text-ink-soft/60"
                  >
                    {program.shortDescription}
                  </p>
                )}
              </div>
            </td>

            {/* INSTITUTION */}
            <td className="px-3 py-2.5 align-middle">
              <div className="min-w-0">
                <p
                  title={
                    program.institutionProfile?.institutionName || ""
                  }
                  className="truncate text-xs font-medium text-ink"
                >
                  {program.institutionProfile?.institutionName || "—"}
                </p>

                {program.institutionProfile?.city && (
                  <p className="truncate text-[10px] text-ink-soft/60">
                    {program.institutionProfile.city}
                  </p>
                )}
              </div>
            </td>

            {/* CATÉGORIE */}
            <td className="px-3 py-2.5 align-middle">
              {program.category ? (
                <span
                  title={program.category}
                  className="inline-block max-w-full truncate rounded-md bg-wine-50 px-2 py-0.5 text-[10px] font-semibold text-wine-600"
                >
                  {program.category}
                </span>
              ) : (
                <span className="text-xs text-ink-soft/50">—</span>
              )}
            </td>

            {/* MONTANT */}
            <td className="px-3 py-2.5 align-middle">
              <span className="whitespace-nowrap text-[11px] font-semibold text-ink">
                {formatAmount(
                  program.amountMax,
                  program.currency
                )}
              </span>
            </td>

            {/* DATE */}
            <td className="px-3 py-2.5 align-middle">
              <span className="whitespace-nowrap text-[11px] text-ink-soft">
                {formatDate(program.closingDate)}
              </span>
            </td>

            {/* STATUT */}
            <td className="px-3 py-2.5 align-middle">
              <span
                className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </td>

            {/* ACTIONS */}
            <td className="px-3 py-2.5 align-middle">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/programs/${program.id}`)
                  }
                  title="Voir"
                  aria-label="Voir"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition hover:bg-sand-100 hover:text-wine-700"
                >
                  <Eye size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => deleteProgram(program.id)}
                  disabled={deletingId === program.id}
                  title="Supprimer"
                  aria-label="Supprimer"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deletingId === program.id ? (
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
    );
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <div className="card-surface rounded-2xl p-8 shadow-card">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-7 text-center">
          <h3 className="font-display text-lg font-semibold text-wine-700">
            Une erreur est survenue
          </h3>

          <p className="mt-2 text-sm text-wine-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadPrograms()}
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="card-surface overflow-hidden rounded-2xl shadow-card">

      {/* =====================================================
          TABLE HEADER
      ====================================================== */}
      <div className="border-b border-sand-200 px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Title */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
                <Landmark
                  size={17}
                  className="text-rose-500"
                />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-wine-700">
                  Programmes
                </h2>

                <p className="text-xs text-ink-soft">
                  {total} programme
                  {total !== 1 ? "s" : ""} enregistré
                  {total !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Search + refresh */}
          <div className="flex w-full items-center gap-2 sm:w-auto">

            <div className="relative w-full sm:w-[280px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher un programme..."
                className="
                  focus-ring
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-sand-200
                  bg-sand-50
                  pl-9
                  pr-3
                  text-sm
                  text-ink
                  outline-none
                  transition
                  placeholder:text-ink-soft/50
                  focus:border-rose-300
                  focus:bg-white
                "
              />
            </div>

            <button
              type="button"
              onClick={() => loadPrograms(true)}
              disabled={refreshing}
              aria-label="Actualiser"
              title="Actualiser"
              className="
                focus-ring
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-sand-200
                bg-white
                text-ink-soft
                transition
                hover:bg-sand-50
                hover:text-ink
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          EMPTY
      ====================================================== */}
      {filteredPrograms.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rise-gradient-soft text-rose-500">
            <Landmark size={22} />
          </div>

          <p className="text-sm font-medium text-ink">
            {search
              ? "Aucun programme ne correspond à votre recherche."
              : "Aucun programme trouvé."}
          </p>

          {!search && (
            <p className="mt-2 max-w-md text-xs leading-5 text-ink-soft">
              Les programmes publiés par les institutions
              apparaîtront ici.
            </p>
          )}
        </div>
      ) : (
        /*
         * TABLE
         */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-fixed text-left">

            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[18%]" />
              <col className="w-[13%]" />
              <col className="w-[14%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
            </colgroup>

            {/* Header */}
            <thead>
              <tr className="border-b border-sand-200 bg-sand-50/80">

                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                  Programme
                </th>

                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                  Institution
                </th>

                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                  Catégorie
                </th>

                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                  Montant max
                </th>

                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                  Date limite
                </th>

                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                  Statut
                </th>

                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                  Actions
                </th>

              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-sand-100">

              {filteredPrograms.map((program) => {
                const status = getStatus(program);

                return (
                  <tr
                    key={program.id}
                    className="group transition-colors hover:bg-rose-50/20"
                  >

                    {/* PROGRAM */}
                    <td className="px-5 py-4 align-middle">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {program.title}
                        </p>

                        {program.shortDescription && (
                          <p className="mt-1 truncate text-xs text-ink-soft/70">
                            {program.shortDescription}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* INSTITUTION */}
                    <td className="px-5 py-4 align-middle">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {program.institutionProfile
                            ?.institutionName || "—"}
                        </p>

                        {program.institutionProfile?.city && (
                          <p className="mt-0.5 truncate text-xs text-ink-soft/70">
                            {program.institutionProfile.city}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-4 align-middle">
                      {program.category ? (
                        <span className="inline-flex max-w-full truncate rounded-lg bg-wine-50 px-2.5 py-1 text-xs font-semibold text-wine-600">
                          {program.category}
                        </span>
                      ) : (
                        <span className="text-sm text-ink-soft/50">
                          —
                        </span>
                      )}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-5 py-4 align-middle">
                      <span className="whitespace-nowrap text-sm font-semibold text-ink">
                        {formatAmount(
                          program.amountMax,
                          program.currency
                        )}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-4 align-middle">
                      <span className="whitespace-nowrap text-sm text-ink-soft">
                        {formatDate(
                          program.closingDate
                        )}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`
                          inline-flex
                          whitespace-nowrap
                          rounded-lg
                          border
                          px-2.5
                          py-1
                          text-[11px]
                          font-semibold
                          ${status.className}
                        `}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-1">

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/programs/${program.id}`
                            )
                          }
                          title="Voir le programme"
                          aria-label="Voir le programme"
                          className="
                            focus-ring
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-ink-soft
                            transition
                            hover:bg-sand-100
                            hover:text-wine-700
                          "
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteProgram(program.id)
                          }
                          disabled={
                            deletingId === program.id
                          }
                          title="Supprimer"
                          aria-label="Supprimer"
                          className="
                            focus-ring
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-rose-500
                            transition
                            hover:bg-rose-50
                            hover:text-rose-600
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          {deletingId === program.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}