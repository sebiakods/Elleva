"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Trash2,
  FileCheck2,
  Clock3,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

type ApplicationType = "EXPERT" | "INSTITUTION";
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ApplicationRequest {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  fullName: string;
  email: string;
  createdAt: string;
}

interface RawApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  email: string;
  fullName?: string;
  organizationName?: string;
  contactName?: string;
}

const TYPE_LABELS: Record<ApplicationType, string> = {
  EXPERT: "Experte",
  INSTITUTION: "Institution",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
};

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

function formatDate(date: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  if (status === "APPROVED") {
    return (
      <Badge tone="wine">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
        Validée
      </Badge>
    );
  }

  if (status === "REJECTED") {
    return (
      <Badge tone="rose">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
        Refusée
      </Badge>
    );
  }

  return (
    <Badge tone="gold">
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      En attente
    </Badge>
  );
}

async function fetchApplications(
  type: ApplicationType,
  token: string | null
): Promise<ApplicationRequest[]> {
  const endpoint = type === "EXPERT" ? "expert-applications" : "institution-applications";

  const response = await fetch(`${API_URL}/${endpoint}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      type === "EXPERT"
        ? "Impossible de charger les candidatures expertes."
        : "Impossible de charger les candidatures institutions."
    );
  }

  const data: { applications?: RawApplication[] } = await response.json();

  return (data.applications ?? []).map((a) => ({
    id: a.id,
    type,
    status: a.status,
    fullName: a.fullName || a.organizationName || a.contactName || a.email,
    email: a.email,
    createdAt: a.createdAt,
  }));
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ApplicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const [experts, institutions] = await Promise.all([
        fetchApplications("EXPERT", token),
        fetchApplications("INSTITUTION", token),
      ]);

      const merged = [...experts, ...institutions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRequests(merged);
    } catch (err) {
      console.error("FETCH REQUESTS ERROR:", err);
      setError(err instanceof Error ? err.message : "Impossible de charger les demandes.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleDelete(id: string, type: ApplicationType) {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer cette demande ?");
    if (!confirmed) return;

    try {
      const token = getAuthToken();
      const endpoint = type === "EXPERT" ? "expert-applications" : "institution-applications";

      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Erreur lors de la suppression.");
      }

      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      console.error("DELETE REQUEST ERROR:", err);
      alert(err instanceof Error ? err.message : "Impossible de supprimer cette demande.");
    }
  }

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;

    return requests.filter((request) => {
      return (
        request.fullName?.toLowerCase().includes(query) ||
        request.email?.toLowerCase().includes(query) ||
        TYPE_LABELS[request.type]?.toLowerCase().includes(query) ||
        STATUS_LABELS[request.status]?.toLowerCase().includes(query)
      );
    });
  }, [requests, search]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    }),
    [requests]
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 text-sm text-ink-soft">
        <span>Espace Admin</span>
        <span className="mx-2 text-ink-soft/40">/</span>
        <span className="font-medium text-wine-700">Gestion des demandes</span>
      </div>

      <div className="relative mb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <p className="font-script text-2xl leading-none text-rose-500">Administration,</p>

        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          Gestion des <span className="text-gradient-rise">demandes</span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Consultez, examinez et gérez les demandes d'inscription des expertes et des institutions
          sur Ellevadz.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-rose-300 focus-within:shadow-card">
          <Search size={17} className="shrink-0 text-ink-soft" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une demande..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-full p-1 text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink"
              aria-label="Effacer la recherche"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <p className="text-xs text-ink-soft">
          {filteredRequests.length} demande{filteredRequests.length !== 1 ? "s" : ""} affichée
          {filteredRequests.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-full p-1 transition-colors hover:bg-rose-100"
            aria-label="Fermer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Total demandes
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading ? "…" : stats.total}
              </p>
              <p className="mt-1 text-xs text-ink-soft">Toutes les demandes</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <Users size={18} className="text-rose-500" />
            </div>
          </div>
        </div>

        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                En attente
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading ? "…" : stats.pending}
              </p>
              <p className="mt-1 text-xs text-ink-soft">À examiner</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Clock3 size={18} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Validées</p>
              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading ? "…" : stats.approved}
              </p>
              <p className="mt-1 text-xs text-ink-soft">Demandes acceptées</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-50">
              <FileCheck2 size={18} className="text-wine-700" />
            </div>
          </div>
        </div>

        <div className="card-surface p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Refusées</p>
              <p className="mt-2 font-display text-3xl font-semibold text-wine-900">
                {loading ? "…" : stats.rejected}
              </p>
              <p className="mt-1 text-xs text-ink-soft">Demandes refusées</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <X size={18} className="text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden shadow-card">
        <div className="flex flex-col gap-2 border-b border-sand-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Demandes d'inscription
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Liste des demandes reçues par la plateforme.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50/70">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Candidat
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Type
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Date
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Statut
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-rose-500" />
                      <p className="text-sm text-ink-soft">Chargement des demandes...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRequests.map((request) => (
                  <tr
                    key={`${request.type}-${request.id}`}
                    className="group border-b border-sand-100 last:border-b-0 transition-colors hover:bg-rose-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rise-gradient text-xs font-semibold text-white shadow-sm">
                          {getInitials(request.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{request.fullName}</p>
                          <p className="truncate text-xs text-ink-soft">{request.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge tone={request.type === "EXPERT" ? "wine" : "gold"}>
                        {TYPE_LABELS[request.type]}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-sm text-ink-soft">
                      {formatDate(request.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/requests/${request.type.toLowerCase()}/${request.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs font-medium text-ink transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Eye size={15} />
                          <span className="hidden sm:inline">Voir</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(request.id, request.type)}
                          className="inline-flex items-center justify-center rounded-xl border border-rose-100 bg-white p-2 text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-700"
                          aria-label="Supprimer la demande"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-50">
                        <Search size={22} className="text-ink-soft" />
                      </div>
                      <p className="font-medium text-ink">Aucune demande trouvée</p>
                      <p className="mt-1 text-xs leading-5 text-ink-soft">
                        {search
                          ? "Essayez avec un autre terme de recherche."
                          : "Aucune demande d'inscription n'est disponible pour le moment."}
                      </p>
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="mt-4 text-xs font-medium text-rose-600 hover:text-rose-700"
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