"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/services/api";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Filter,
  User,
  Mail,
  FileText,
  ChevronRight,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Applicant {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
}

interface Program {
  title: string;
  category: string;
  sector?: string | null;
  region?: string | null;
  amountMin?: string;
  amountMax?: string;
  currency?: string;
}

type AppStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WAITLISTED";

interface ApplicationItem {
  id: string;
  status: AppStatus;
  amountRequested: string;
  coverLetter?: string | null;
  notes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  applicant: Applicant;
  program: Program;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T[] | { items: T[]; pagination?: unknown };
}

/* -------------------------------------------------------------------------- */
/* Configurations & Styling Constants                                         */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<AppStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "En attente",
  UNDER_REVIEW: "En cours d'examen",
  APPROVED: "Acceptée",
  REJECTED: "Refusée",
  WAITLISTED: "Liste d'attente",
};

const STATUS_STYLES: Record<
  AppStatus,
  { badge: string; icon: React.ReactNode }
> = {
  DRAFT: {
    badge: "bg-sand-100 text-ink-soft border border-sand-300",
    icon: <Clock size={12} />,
  },
  SUBMITTED: {
    badge: "bg-amber-50 text-amber-800 border border-amber-200/60",
    icon: <Clock size={12} />,
  },
  UNDER_REVIEW: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200/60",
    icon: <Clock size={12} />,
  },
  APPROVED: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    badge: "bg-rose-50 text-wine-900 border border-rose-200/60",
    icon: <XCircle size={12} />,
  },
  WAITLISTED: {
    badge: "bg-purple-50 text-purple-700 border border-purple-200/60",
    icon: <AlertCircle size={12} />,
  },
};

const FILTERS: { value: "ALL" | AppStatus; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "SUBMITTED", label: "En attente" },
  { value: "UNDER_REVIEW", label: "En cours" },
  { value: "APPROVED", label: "Acceptées" },
  { value: "REJECTED", label: "Refusées" },
  { value: "WAITLISTED", label: "Liste d'attente" },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatMoney(value?: string, currency = "DZD") {
  if (!value) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("fr-FR").format(n) + " " + currency;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Main Page Component                                                        */
/* -------------------------------------------------------------------------- */

export default function InstitutionApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AppStatus>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApplicationItem | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await api.get<ApiEnvelope<ApplicationItem>>(
        `/applications?${params.toString()}`
      );

      const items = Array.isArray(res.data) ? res.data : res.data.items;
      setApplications(items ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur de chargement des candidatures"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function updateStatus(id: string, status: AppStatus) {
    setUpdatingId(id);
    const previous = applications;
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));

    try {
      await api.patch(`/applications/${id}/status`, { status });
    } catch (err) {
      setApplications(previous);
      alert(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.applicant.name.toLowerCase().includes(q) ||
        a.program.title.toLowerCase().includes(q)
      );
    });
  }, [applications, search]);

  return (
    <main className="min-h-screen bg-sand-50">
              {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Institution</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Candidatures</span>
        </div>

        {/* Header Section */}
        <div className="relative mb-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Gestion des dossiers
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Examen des <span className="text-gradient-rise">candidatures</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Examinez les dossiers soumis par les entrepreneures. Approuvez, rejetez
            ou mettez en liste d&apos;attente chaque candidature en un clic.
          </p>
        </div>
      <div className="mx-auto max-w-7xl px-6 py-10">


        {/* Controls Toolbar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une candidate, un programme..."
              className="w-full rounded-xl border border-sand-200 bg-sand-50/50 py-2.5 pl-10 pr-4 text-sm text-wine-900 placeholder:text-ink-soft/50 focus:border-wine-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wine-700 transition"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={14} className="mr-1 hidden text-ink-soft sm:block" />
            {FILTERS.map((f) => {
              const active = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-wine-900 text-white shadow-sm"
                      : "bg-sand-50 text-ink-soft hover:bg-sand-100 hover:text-wine-900"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-sand-200 bg-white p-16 text-center shadow-card">
            <Loader2 size={28} className="animate-spin text-wine-700" />
            <p className="mt-4 text-sm font-medium text-ink-soft">
              Chargement des candidatures en cours...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-10 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-display text-lg font-semibold text-wine-900">
              Une erreur est survenue
            </h3>
            <p className="mt-2 text-sm text-ink-soft">{error}</p>
            <button
              onClick={loadApplications}
              className="mt-6 rounded-xl bg-wine-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-wine-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-sand-200 bg-white p-16 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
              <FileText size={22} />
            </div>
            <h3 className="font-display text-base font-semibold text-wine-900">
              Aucune candidature trouvée
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              Essayez de modifier votre recherche ou vos filtres.
            </p>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((application) => {
              const statusInfo = STATUS_STYLES[application.status];

              return (
                <div
                  key={application.id}
                  onClick={() => setSelected(application)}
                  className="group relative cursor-pointer rounded-2xl border border-sand-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-sand-300 hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    {/* Applicant & Program Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand-100 font-display font-semibold text-wine-900 shadow-inner">
                        {application.applicant.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={application.applicant.avatarUrl}
                            alt={application.applicant.name}
                            className="h-12 w-12 rounded-2xl object-cover"
                          />
                        ) : (
                          initials(application.applicant.name)
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display font-semibold text-wine-900 group-hover:text-rose-500 transition-colors">
                            {application.applicant.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badge}`}
                          >
                            {statusInfo.icon}
                            {STATUS_LABELS[application.status]}
                          </span>
                        </div>

                        <p className="text-xs text-ink-soft">
                          {application.applicant.email}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-ink-soft">
                          <span className="flex items-center gap-1 font-medium text-wine-700">
                            <Sparkles size={13} className="text-rose-500" />
                            {application.program.title}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {formatDate(application.createdAt)}
                          </span>
                        </div>

                        <div className="pt-1 text-xs font-semibold text-wine-900">
                          Montant demandé :{" "}
                          <span className="text-rose-500">
                            {formatMoney(
                              application.amountRequested,
                              application.program.currency
                            )}
                          </span>
                        </div>

                        {application.coverLetter && (
                          <p className="mt-2 line-clamp-2 max-w-2xl text-xs text-ink-soft/80 italic">
                            &ldquo;{application.coverLetter}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex flex-wrap items-center gap-2 border-t border-sand-100 pt-4 lg:border-t-0 lg:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        disabled={updatingId === application.id}
                        onClick={() => updateStatus(application.id, "APPROVED")}
                        className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approuver
                      </button>

                      <button
                        disabled={updatingId === application.id}
                        onClick={() =>
                          updateStatus(application.id, "WAITLISTED")
                        }
                        className="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        Liste d&apos;attente
                      </button>

                      <button
                        disabled={updatingId === application.id}
                        onClick={() => updateStatus(application.id, "REJECTED")}
                        className="rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50"
                      >
                        Refuser
                      </button>

                      <button
                        onClick={() => setSelected(application)}
                        aria-label="Voir les détails"
                        className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl bg-sand-50 text-ink-soft hover:bg-sand-100 hover:text-wine-900 transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Detail View */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-wine-900/40 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-sand-200 bg-white p-6 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-sand-50 text-ink-soft hover:bg-sand-100 hover:text-wine-900 transition"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sand-100 font-display text-xl font-bold text-wine-900">
                  {selected.applicant.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.applicant.avatarUrl}
                      alt={selected.applicant.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    initials(selected.applicant.name)
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-xl font-bold text-wine-900">
                    {selected.applicant.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <Mail size={13} />
                    <span>{selected.applicant.email}</span>
                  </div>
                  {selected.applicant.createdAt && (
                    <div className="flex items-center gap-2 text-xs text-ink-soft/70">
                      <User size={13} />
                      <span>
                        Membre depuis {formatDate(selected.applicant.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[selected.status].badge
                  }`}
                >
                  {STATUS_STYLES[selected.status].icon}
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>

              {/* Candidate Bio */}
              {selected.applicant.bio && (
                <div className="mt-5 rounded-xl border border-sand-200 bg-sand-50/50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    À propos de la candidate
                  </h4>
                  <p className="mt-1 text-sm text-wine-900">
                    {selected.applicant.bio}
                  </p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-sand-200 bg-sand-50/30 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Programme
                  </p>
                  <p className="text-xs font-semibold text-wine-900">
                    {selected.program.title}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Catégorie
                  </p>
                  <p className="text-xs font-semibold text-wine-900">
                    {selected.program.category}
                  </p>
                </div>

                {selected.program.sector && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      Secteur
                    </p>
                    <p className="text-xs font-semibold text-wine-900">
                      {selected.program.sector}
                    </p>
                  </div>
                )}

                {selected.program.region && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      Région
                    </p>
                    <p className="text-xs font-semibold text-wine-900">
                      {selected.program.region}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Montant demandé
                  </p>
                  <p className="text-xs font-semibold text-rose-500">
                    {formatMoney(
                      selected.amountRequested,
                      selected.program.currency
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Date de soumission
                  </p>
                  <p className="text-xs font-semibold text-wine-900">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
              </div>

              {/* Cover Letter */}
              {selected.coverLetter && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Lettre de motivation
                  </h4>
                  <div className="mt-2 rounded-xl border border-sand-200 bg-white p-4 text-xs leading-relaxed text-wine-900">
                    {selected.coverLetter}
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              {selected.notes && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Notes internes
                  </h4>
                  <div className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 text-xs text-amber-900">
                    {selected.notes}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-8 flex flex-col gap-2 border-t border-sand-200 pt-5 sm:flex-row">
                <button
                  disabled={updatingId === selected.id}
                  onClick={() => updateStatus(selected.id, "APPROVED")}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  Approuver la candidature
                </button>
                <button
                  disabled={updatingId === selected.id}
                  onClick={() => updateStatus(selected.id, "WAITLISTED")}
                  className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  Liste d&apos;attente
                </button>
                <button
                  disabled={updatingId === selected.id}
                  onClick={() => updateStatus(selected.id, "REJECTED")}
                  className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-600 disabled:opacity-50 transition"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}