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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

interface ProgramsResponse {
  success: boolean;
  items: Program[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
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

    // Your application may use either key.
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    console.log("ADMIN TOKEN EXISTS:", !!token);

    if (!token) {
      throw new Error(
        "Session expirée. Veuillez vous reconnecter."
      );
    }

    console.log(
      "REQUEST:",
      `${API_URL}/admin/programs`
    );

    const response = await fetch(
      `${API_URL}/admin/programs?page=1&pageSize=100&sort=newest`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    console.log(
      "ADMIN PROGRAMS STATUS:",
      response.status
    );

    const result = await response.json();

    console.log(
      "ADMIN PROGRAMS RESPONSE:",
      result
    );

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

    setTotal(
      result.pagination?.total || 0
    );
  } catch (err) {
    console.error(
      "ADMIN PROGRAMS ERROR:",
      err
    );

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
    if (
      amount === undefined ||
      amount === null
    ) {
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
        className: "bg-sand-200 text-ink-soft",
      };
    }

    if (program.isPublished) {
      return {
        label: "Publié",
        className: "bg-green-100 text-green-700",
      };
    }

    return {
      label: "Brouillon",
      className: "bg-gold-400/20 text-gold-500",
    };
  }

  async function deleteProgram(id: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce programme ?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Session expirée. Veuillez vous reconnecter."
        );
      }

      const response = await fetch(
        `${API_URL}/admin/programs/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    const query = search.toLowerCase();

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

  if (loading) {
    return (
      <div className="card-surface flex min-h-[320px] items-center justify-center shadow-card">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
          <span className="font-body text-sm text-ink-soft">
            Chargement des programmes...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface p-8 shadow-card">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <h3 className="font-display font-semibold text-wine-700">
            Erreur
          </h3>

          <p className="font-body mt-2 text-sm text-wine-700">
            {error}
          </p>

          <button
            onClick={() => loadPrograms()}
            className="focus-ring font-body mt-5 inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden shadow-card">
      {/* Table header */}
      <div className="flex flex-col gap-4 border-b border-sand-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-wine-700">
            Programmes
          </h2>

          <p className="font-body text-sm text-ink-soft">
            {total} programme
            {total !== 1 ? "s" : ""} dans la base de données
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="focus-ring font-body w-48 rounded-xl border border-sand-200 bg-sand-50 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white sm:w-56"
            />
          </div>

          <button
            onClick={() => loadPrograms(true)}
            disabled={refreshing}
            className="focus-ring rounded-xl border border-sand-200 p-2.5 text-ink-soft transition hover:bg-sand-100 disabled:opacity-60"
            title="Actualiser"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Empty */}
      {filteredPrograms.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rise-gradient-soft text-rose-500">
            <Landmark size={22} />
          </div>

          <p className="font-body text-ink">
            {search
              ? "Aucun programme ne correspond à votre recherche."
              : "Aucun programme trouvé dans la base de données."}
          </p>

          {!search && (
            <p className="font-body mt-2 text-xs text-ink-soft/70">
              Les programmes publiés par les institutions apparaîtront ici.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-sand-200 bg-sand-50">
              <tr>
                <th className="font-body px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  Programme
                </th>

                <th className="font-body px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  Institution
                </th>

                <th className="font-body px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  Catégorie
                </th>

                <th className="font-body px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  Montant max
                </th>

                <th className="font-body px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  Date limite
                </th>

                <th className="font-body px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  Statut
                </th>

                <th className="font-body px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
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
                    className="transition hover:bg-sand-50"
                  >
                    {/* Program */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-body font-medium text-ink">
                          {program.title}
                        </p>

                        {program.shortDescription && (
                          <p className="font-body mt-1 max-w-xs truncate text-xs text-ink-soft/70">
                            {program.shortDescription}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-body font-medium text-ink">
                          {program.institutionProfile
                            ?.institutionName || "—"}
                        </p>

                        {program.institutionProfile?.city && (
                          <p className="font-body text-xs text-ink-soft/70">
                            {program.institutionProfile.city}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      {program.category ? (
                        <span className="font-body rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-500">
                          {program.category}
                        </span>
                      ) : (
                        <span className="font-body text-sm text-ink-soft/60">
                          —
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="font-body px-6 py-4 text-sm font-medium text-ink">
                      {formatAmount(
                        program.amountMax,
                        program.currency
                      )}
                    </td>

                    {/* Closing date */}
                    <td className="font-body px-6 py-4 text-sm text-ink-soft">
                      {formatDate(program.closingDate)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`font-body rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/programs/${program.id}`
                            )
                          }
                          className="focus-ring rounded-lg p-2 text-ink-soft transition hover:bg-sand-100 hover:text-ink"
                          title="Voir"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            deleteProgram(program.id)
                          }
                          disabled={deletingId === program.id}
                          className="focus-ring rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === program.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
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
    </div>
  );
}