"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Landmark,
  Calendar,
  Wallet,
  MapPin,
  SlidersHorizontal,
  X,
  CheckCircle2,
  ListChecks,
  LayoutGrid,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token")
  );
}

interface Program {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  sector?: string;
  fundingType?: string;
  amountMin?: string;
  amountMax?: string;
  currency?: string;
  openingDate?: string;
  closingDate?: string;
  region?: string;
  status?: string;
  institution?: {
    name?: string;
  };
}

interface MyApplication {
  id: string;
  programId?: string;
  status?: string;
  amountRequested?: string | number;
  createdAt?: string;
  program?: {
    id?: string;
    title?: string;
    category?: string;
    currency?: string;
    institution?: { name?: string };
  };
}

function formatCategory(category?: string): string {
  if (!category) return "";
  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatAmount(value?: string | number): string {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("fr-FR");
}

function formatDate(date?: string): string {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(date?: string): number | null {
  if (!date) return null;
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function DeadlineTag({ closingDate }: { closingDate?: string }) {
  if (!closingDate) return null;

  const days = daysUntil(closingDate);
  const formatted = formatDate(closingDate);

  if (days === null) return null;

  const isUrgent = days >= 0 && days <= 14;
  const isClosed = days < 0;

  return (
    <span
      className={`font-body inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isClosed
          ? "bg-sand-200 text-ink-soft"
          : isUrgent
          ? "bg-gold-400/20 text-gold-500"
          : "bg-green-100 text-green-700"
      }`}
    >
      <Calendar size={12} />
      {isClosed
        ? "Clôturé"
        : isUrgent
        ? `Clôture dans ${days} j`
        : `Clôture le ${formatted}`}
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status?: string }) {
  const normalized = (status || "").toUpperCase();

  let classes = "bg-sand-200 text-ink-soft";
  if (normalized === "APPROVED" || normalized === "ACCEPTED") {
    classes = "bg-green-100 text-green-700";
  } else if (normalized === "REJECTED" || normalized === "REFUSED") {
    classes = "bg-rose-100 text-wine-700";
  } else if (normalized === "PENDING" || normalized === "SUBMITTED") {
    classes = "bg-gold-400/20 text-gold-500";
  }

  return (
    <span
      className={`font-body inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatCategory(status) || "En attente"}
    </span>
  );
}

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  // Browse tab state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // My applications tab state
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [myAppsLoading, setMyAppsLoading] = useState(true);
  const [myAppsError, setMyAppsError] = useState("");

  const appliedIds = useMemo(() => {
    const ids = new Set<string>();
    myApplications.forEach((application) => {
      const pid = application.program?.id || application.programId;
      if (pid) ids.add(String(pid));
    });
    return ids;
  }, [myApplications]);

  // Apply modal state
  const [applyTarget, setApplyTarget] = useState<Program | null>(null);
  const [amountRequested, setAmountRequested] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/programs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Erreur lors du chargement des programmes"
        );
      }

      const result = await response.json();

      setPrograms(result.items || result.data || result.programs || []);
    } catch (err: unknown) {
      console.error("LOAD PROGRAMS ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des programmes"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyApplications = useCallback(async () => {
    try {
      setMyAppsLoading(true);
      setMyAppsError("");

      const token = getToken();

      if (!token) {
        setMyApplications([]);
        return;
      }

      const response = await fetch(`${API_URL}/my/applications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Erreur lors du chargement de vos candidatures"
        );
      }

      const result = await response.json();

      setMyApplications(
        result.items || result.data || result.applications || []
      );
    } catch (err) {
      console.error("LOAD MY APPLICATIONS ERROR:", err);
      setMyAppsError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement de vos candidatures"
      );
    } finally {
      setMyAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
    loadMyApplications();
  }, [loadPrograms, loadMyApplications]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    programs.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [programs]);

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" || program.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const hasActiveFilters = categoryFilter !== "ALL" || search.length > 0;

  function openApplyModal(program: Program) {
    setApplyTarget(program);
    setAmountRequested("");
    setApplyMessage("");
    setApplyError("");
  }

  function closeApplyModal() {
    if (applying) return;
    setApplyTarget(null);
  }

  async function submitApplication() {
    if (!applyTarget) return;

    try {
      setApplying(true);
      setApplyError("");

      const token = getToken();

      if (!token) {
        setApplyError(
          "Authentification requise. Veuillez vous reconnecter."
        );
        return;
      }

      const res = await fetch(
        `${API_URL}/programs/${applyTarget.id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amountRequested: amountRequested
              ? Number(amountRequested)
              : undefined,
            message: applyMessage.trim() || undefined,
          }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Échec de la candidature (${res.status})`
        );
      }

      // Refresh "My Programs" so the new application shows up immediately.
      await loadMyApplications();

      setApplyTarget(null);
    } catch (err) {
      console.error("APPLY ERROR:", err);
      setApplyError(
        err instanceof Error ? err.message : "Échec de la candidature."
      );
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-sand-200 bg-white p-6 shadow-card sm:flex-row sm:items-end sm:justify-between md:p-8">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
              Financement
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-wine-700 md:text-4xl">
              Programmes de financement
            </h1>
            <p className="font-body mt-2 text-ink-soft">
              L&apos;accès à tous les programmes est gratuit. Postulez à
              autant de programmes que vous le souhaitez.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-sand-200 bg-white p-1.5 shadow-card sm:inline-flex">
          <button
            onClick={() => setActiveTab("all")}
            className={`font-body flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "all"
                ? "bg-rise-gradient text-white shadow-bloom"
                : "text-ink-soft hover:bg-sand-100"
            }`}
          >
            <LayoutGrid size={16} />
            Tous les programmes
          </button>

          <button
            onClick={() => setActiveTab("mine")}
            className={`font-body flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "mine"
                ? "bg-rise-gradient text-white shadow-bloom"
                : "text-ink-soft hover:bg-sand-100"
            }`}
          >
            <ListChecks size={16} />
            Mes programmes
            {myApplications.length > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1.5 text-xs">
                {myApplications.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "all" && (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {/* Search */}
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un programme…"
                  className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white sm:w-64"
                />
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`focus-ring font-body inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  showFilters || categoryFilter !== "ALL"
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-sand-200 bg-white text-ink-soft hover:bg-sand-100"
                }`}
              >
                <SlidersHorizontal size={16} />
                Filtres
                {categoryFilter !== "ALL" && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && categories.length > 0 && (
              <div className="animate-rise mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-sand-200 bg-white p-4 shadow-card">
                <span className="font-body mr-1 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  Catégorie
                </span>

                <button
                  onClick={() => setCategoryFilter("ALL")}
                  className={`font-body rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    categoryFilter === "ALL"
                      ? "bg-rise-gradient text-white"
                      : "bg-sand-100 text-ink-soft hover:bg-sand-200"
                  }`}
                >
                  Toutes
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`font-body rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      categoryFilter === cat
                        ? "bg-rise-gradient text-white"
                        : "bg-sand-100 text-ink-soft hover:bg-sand-200"
                    }`}
                  >
                    {formatCategory(cat)}
                  </button>
                ))}

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setCategoryFilter("ALL");
                      setSearch("");
                    }}
                    className="font-body ml-1 inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
                  >
                    <X size={13} />
                    Réinitialiser
                  </button>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card-surface p-5 shadow-card">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-sand-100" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-sand-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-sand-100" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-2.5">
                      <div className="h-3 w-full animate-pulse rounded bg-sand-100" />
                      <div className="h-3 w-5/6 animate-pulse rounded bg-sand-100" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-sand-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="font-body rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-wine-700">
                {error}
                <div className="mt-4">
                  <button
                    onClick={loadPrograms}
                    className="focus-ring font-body rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredPrograms.length === 0 && (
              <div className="card-surface animate-rise flex flex-col items-center p-14 text-center shadow-card">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rise-gradient-soft text-2xl text-rose-500">
                  <Landmark size={26} />
                </div>

                <h2 className="font-display text-2xl font-semibold text-wine-700">
                  Aucun programme trouvé
                </h2>

                <p className="font-body mt-2 max-w-sm text-ink-soft">
                  {hasActiveFilters
                    ? "Essayez d'ajuster votre recherche ou vos filtres."
                    : "Aucun programme de financement n'est disponible pour le moment."}
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setCategoryFilter("ALL");
                      setSearch("");
                    }}
                    className="focus-ring font-body mt-6 inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-sand-100"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {/* Cards */}
            {!loading && !error && filteredPrograms.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPrograms.map((program, index) => {
                  const alreadyApplied = appliedIds.has(program.id);

                  return (
                    <div
                      key={program.id}
                      style={{ animationDelay: `${(index % 6) * 60}ms` }}
                      className="card-surface animate-rise group flex flex-col p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-bloom"
                    >
                      {/* Title */}
                      <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rise-gradient-soft">
                          <Landmark size={20} className="text-rose-500" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="font-display text-lg font-semibold leading-snug text-ink">
                            {program.title}
                          </h2>
                          {program.institution?.name && (
                            <p className="font-body mt-0.5 truncate text-xs text-ink-soft/70">
                              {program.institution.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Category + funding type badges */}
                      {(program.category || program.fundingType) && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {program.category && (
                            <span className="font-body rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-500">
                              {formatCategory(program.category)}
                            </span>
                          )}
                          {program.fundingType && (
                            <span className="font-body rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-soft">
                              {program.fundingType}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Amount */}
                      {program.amountMax && (
                        <div className="mb-3 rounded-xl bg-sand-100 p-3.5">
                          <div className="font-body flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                            <Wallet size={13} />
                            Montant max
                          </div>
                          <p className="font-display mt-1 text-base font-semibold text-wine-700">
                            {formatAmount(program.amountMax)}{" "}
                            <span className="font-body text-sm font-medium text-ink-soft">
                              {program.currency || "DZD"}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Region */}
                      {program.region && (
                        <p className="font-body mb-2 flex items-center gap-1.5 text-sm text-ink-soft">
                          <MapPin size={14} className="text-gold-500" />
                          {program.region}
                        </p>
                      )}

                      {/* Description */}
                      {program.shortDescription && (
                        <p className="font-body mt-1 line-clamp-3 text-sm leading-6 text-ink-soft">
                          {program.shortDescription}
                        </p>
                      )}

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Footer: deadline + apply */}
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-sand-200 pt-4">
                        <DeadlineTag closingDate={program.closingDate} />

                        {alreadyApplied ? (
                          <span className="font-body inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={14} />
                            Déjà postulé
                          </span>
                        ) : (
                          <button
                            onClick={() => openApplyModal(program)}
                            className="focus-ring font-body rounded-xl bg-rise-gradient px-4 py-2 text-xs font-semibold text-white shadow-bloom transition hover:brightness-105"
                          >
                            Postuler
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "mine" && (
          <>
            {myAppsLoading && (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-2xl bg-sand-100" />
                <div className="h-20 animate-pulse rounded-2xl bg-sand-100" />
                <div className="h-20 animate-pulse rounded-2xl bg-sand-100" />
              </div>
            )}

            {!myAppsLoading && myAppsError && (
              <div className="font-body rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-wine-700">
                {myAppsError}
                <div className="mt-4">
                  <button
                    onClick={loadMyApplications}
                    className="focus-ring font-body rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {!myAppsLoading &&
              !myAppsError &&
              myApplications.length === 0 && (
                <div className="card-surface animate-rise flex flex-col items-center p-14 text-center shadow-card">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rise-gradient-soft text-2xl text-rose-500">
                    <ListChecks size={26} />
                  </div>

                  <h2 className="font-display text-2xl font-semibold text-wine-700">
                    Aucune candidature pour l&apos;instant
                  </h2>

                  <p className="font-body mt-2 max-w-sm text-ink-soft">
                    Parcourez les programmes disponibles et postulez pour les
                    voir apparaître ici.
                  </p>

                  <button
                    onClick={() => setActiveTab("all")}
                    className="focus-ring font-body mt-6 inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
                  >
                    Voir les programmes
                  </button>
                </div>
              )}

            {!myAppsLoading &&
              !myAppsError &&
              myApplications.length > 0 && (
                <div className="space-y-4">
                  {myApplications.map((application) => (
                    <div
                      key={application.id}
                      className="card-surface animate-rise flex flex-col gap-4 p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold text-ink">
                          {application.program?.title || "Programme"}
                        </h3>

                        <div className="font-body mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                          {application.program?.institution?.name && (
                            <span>
                              {application.program.institution.name}
                            </span>
                          )}

                          {application.program?.category && (
                            <span>
                              {formatCategory(application.program.category)}
                            </span>
                          )}

                          <span>
                            Postulé le {formatDate(application.createdAt)}
                          </span>

                          {application.amountRequested !== undefined && (
                            <span>
                              {formatAmount(application.amountRequested)}{" "}
                              {application.program?.currency || "DZD"}{" "}
                              demandés
                            </span>
                          )}
                        </div>
                      </div>

                      <ApplicationStatusBadge status={application.status} />
                    </div>
                  ))}
                </div>
              )}
          </>
        )}
      </div>

      {applyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-bloom">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Candidature
                </p>
                <h3 className="font-display mt-1 text-xl font-bold text-wine-700">
                  {applyTarget.title}
                </h3>
              </div>

              <button
                onClick={closeApplyModal}
                className="rounded-lg p-1.5 text-ink-soft transition hover:bg-sand-100"
              >
                <X size={18} />
              </button>
            </div>

            {applyError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-wine-700">
                {applyError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Montant demandé (optionnel)
                </label>
                <input
                  type="number"
                  min={0}
                  value={amountRequested}
                  onChange={(e) => setAmountRequested(e.target.value)}
                  placeholder="Ex : 500000"
                  className="w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink outline-none transition focus:border-rose-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Message pour l&apos;institution (optionnel)
                </label>
                <textarea
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Présentez brièvement votre projet…"
                  className="w-full resize-none rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink outline-none transition focus:border-rose-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeApplyModal}
                disabled={applying}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-ink disabled:opacity-60"
              >
                Annuler
              </button>

              <button
                onClick={submitApplication}
                disabled={applying}
                className="inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applying && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {applying ? "Envoi…" : "Envoyer ma candidature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}