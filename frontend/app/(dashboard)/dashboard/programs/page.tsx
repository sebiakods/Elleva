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
  Heart,
} from "lucide-react";

const API_URL = '/api';

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
    institution?: {
      name?: string;
    };
  };
}

interface ProgramsResponse {
  items?: Program[];
  data?: Program[];
  programs?: Program[];
}

interface ApplicationsResponse {
  items?: MyApplication[];
  data?: MyApplication[];
  applications?: MyApplication[];
}

function formatCategory(category?: string): string {
  if (!category) return "";

  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAmount(value?: string | number): string {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return String(value);
  }

  return num.toLocaleString("fr-FR");
}

function formatDate(date?: string): string {
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

function daysUntil(date?: string): number | null {
  if (!date) return null;

  const target = new Date(date);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const diffMs = target.getTime() - Date.now();

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function DeadlineTag({
  closingDate,
}: {
  closingDate?: string;
}) {
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

function ApplicationStatusBadge({
  status,
}: {
  status?: string;
}) {
  const normalized = (status || "").toUpperCase();

  let classes = "bg-sand-200 text-ink-soft";

  if (
    normalized === "APPROVED" ||
    normalized === "ACCEPTED"
  ) {
    classes = "bg-green-100 text-green-700";
  } else if (
    normalized === "REJECTED" ||
    normalized === "REFUSED"
  ) {
    classes = "bg-rose-100 text-wine-700";
  } else if (
    normalized === "PENDING" ||
    normalized === "SUBMITTED"
  ) {
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

/**
 * Authenticated API request.
 *
 * Authentication is handled by the httpOnly cookie.
 * No access token is read from localStorage.
 */
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

export default function ProgramsPage() {
  const [activeTab, setActiveTab] =
    useState<"all" | "mine">("all");

  const [programs, setPrograms] =
    useState<Program[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [showFilters, setShowFilters] =
    useState(false);

  const [myApplications, setMyApplications] =
    useState<MyApplication[]>([]);

  const [myAppsLoading, setMyAppsLoading] =
    useState(true);

  const [myAppsError, setMyAppsError] =
    useState("");

  const [applyTarget, setApplyTarget] =
    useState<Program | null>(null);

  const [amountRequested, setAmountRequested] =
    useState("");

  const [applyMessage, setApplyMessage] =
    useState("");

  const [applying, setApplying] =
    useState(false);

  const [applyError, setApplyError] =
    useState("");

  const appliedIds = useMemo(() => {
    const ids = new Set<string>();

    myApplications.forEach((application) => {
      const programId =
        application.program?.id ||
        application.programId;

      if (programId) {
        ids.add(String(programId));
      }
    });

    return ids;
  }, [myApplications]);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/programs");

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            "Erreur lors du chargement des programmes"
        );
      }

      const result =
        (await response.json()) as ProgramsResponse;

      setPrograms(
        result.items ||
          result.data ||
          result.programs ||
          []
      );
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

  const loadMyApplications =
    useCallback(async () => {
      try {
        setMyAppsLoading(true);
        setMyAppsError("");

        const response = await apiFetch(
          "/my/applications"
        );

        if (!response.ok) {
          const errorData =
            await response.json().catch(() => null);

          throw new Error(
            errorData?.message ||
              "Erreur lors du chargement de vos candidatures"
          );
        }

        const result =
          (await response.json()) as ApplicationsResponse;

        setMyApplications(
          result.items ||
            result.data ||
            result.applications ||
            []
        );
      } catch (err: unknown) {
        console.error(
          "LOAD MY APPLICATIONS ERROR:",
          err
        );

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
    void loadPrograms();
    void loadMyApplications();
  }, [loadPrograms, loadMyApplications]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    programs.forEach((program) => {
      if (program.category) {
        categorySet.add(program.category);
      }
    });

    return Array.from(categorySet);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesSearch =
        !normalizedSearch ||
        program.title
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "ALL" ||
        program.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [
    programs,
    search,
    categoryFilter,
  ]);

  const hasActiveFilters =
    categoryFilter !== "ALL" ||
    search.trim().length > 0;

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

      const body: {
        amountRequested?: number;
        message?: string;
      } = {};

      if (amountRequested.trim()) {
        const amount = Number(amountRequested);

        if (!Number.isFinite(amount) || amount < 0) {
          setApplyError(
            "Veuillez saisir un montant valide."
          );
          return;
        }

        body.amountRequested = amount;
      }

      if (applyMessage.trim()) {
        body.message = applyMessage.trim();
      }

      const response = await apiFetch(
        `/programs/${applyTarget.id}/apply`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      const result =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Échec de la candidature (${response.status})`
        );
      }

      await loadMyApplications();

      setApplyTarget(null);
    } catch (err: unknown) {
      console.error("APPLY ERROR:", err);

      setApplyError(
        err instanceof Error
          ? err.message
          : "Échec de la candidature."
      );
    } finally {
      setApplying(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Entrepreneuse</span>

          <span className="mx-2 text-ink-soft/40">
            /
          </span>

          <span className="font-medium text-wine-700">
            Financement
          </span>
        </div>

        {/* Header */}
        <div className="relative mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <div>
            <p className="font-script text-2xl leading-none text-rose-500">
              Vue d&apos;ensemble
            </p>

            <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
              Programmes de{" "}
              <span className="text-gradient-rise">
                financement
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              L&apos;accès à tous les programmes est
              gratuit. Postulez à autant de programmes
              que vous le souhaitez.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-rose-100/70 bg-white p-1.5 shadow-card sm:inline-flex">
          <button
            type="button"
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
            type="button"
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

        {/* ===================================================== */}
        {/* ALL PROGRAMS */}
        {/* ===================================================== */}

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
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Rechercher un programme…"
                  className="focus-ring font-body w-full rounded-xl border border-rose-100/70 bg-sand-50 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white sm:w-64"
                />
              </div>

              {/* Filters */}
              <button
                type="button"
                onClick={() =>
                  setShowFilters((value) => !value)
                }
                className={`focus-ring font-body inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  showFilters ||
                  categoryFilter !== "ALL"
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-rose-100/70 bg-white text-ink-soft hover:bg-sand-100"
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
            {showFilters &&
              categories.length > 0 && (
                <div className="animate-rise mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-rose-100/70 bg-white p-4 shadow-card">
                  <span className="font-body mr-1 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                    Catégorie
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCategoryFilter("ALL")
                    }
                    className={`font-body rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      categoryFilter === "ALL"
                        ? "bg-rise-gradient text-white"
                        : "bg-sand-100 text-ink-soft hover:bg-sand-200"
                    }`}
                  >
                    Toutes
                  </button>

                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() =>
                        setCategoryFilter(category)
                      }
                      className={`font-body rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        categoryFilter === category
                          ? "bg-rise-gradient text-white"
                          : "bg-sand-100 text-ink-soft hover:bg-sand-200"
                      }`}
                    >
                      {formatCategory(category)}
                    </button>
                  ))}

                  {hasActiveFilters && (
                    <button
                      type="button"
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
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-64 animate-pulse rounded-[2rem] border border-rose-100/60 bg-white/70"
                    />
                  )
                )}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="font-body rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-wine-700">
                {error}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => void loadPrograms()}
                    className="focus-ring font-body rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading &&
              !error &&
              filteredPrograms.length === 0 && (
                <div className="animate-rise flex flex-col items-center rounded-[2rem] border border-dashed border-rose-200 bg-white/60 px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                    <Landmark size={22} />
                  </div>

                  <p className="font-script text-xl text-rose-500">
                    Rien à afficher pour
                    l&apos;instant
                  </p>

                  <p className="font-body mt-2 max-w-sm text-sm text-ink-soft">
                    {hasActiveFilters
                      ? "Essayez d'ajuster votre recherche ou vos filtres."
                      : "Aucun programme de financement n'est disponible pour le moment."}
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("ALL");
                        setSearch("");
                      }}
                      className="focus-ring font-body mt-6 inline-flex items-center gap-2 rounded-xl border border-rose-100/70 bg-white px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-sand-100"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}

            {/* Cards */}
            {!loading &&
              !error &&
              filteredPrograms.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredPrograms.map(
                    (program, index) => {
                      const alreadyApplied =
                        appliedIds.has(program.id);

                      return (
                        <div
                          key={program.id}
                          style={{
                            animationDelay: `${
                              (index % 6) * 60
                            }ms`,
                          }}
                          className="card-plan group animate-rise relative flex flex-col overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-200 hover:shadow-bloom"
                        >
                          <div
                            aria-hidden
                            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rise-gradient-soft opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                          />

                          <Heart
                            size={14}
                            className="absolute right-5 top-5 text-rose-200 opacity-0 transition-all duration-300 group-hover:translate-y-0.5 group-hover:opacity-100"
                            fill="currentColor"
                          />

                          {/* Title */}
                          <div className="relative mb-4 flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rise-gradient text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                              <Landmark size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-script text-base leading-none text-rose-400">
                                Programme
                              </p>

                              <h2 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
                                {program.title}
                              </h2>

                              {program.institution?.name && (
                                <p className="font-body mt-0.5 truncate text-xs text-ink-soft/70">
                                  {
                                    program
                                      .institution
                                      .name
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Badges */}
                          {(program.category ||
                            program.fundingType) && (
                            <div className="mb-4 flex flex-wrap gap-2">
                              {program.category && (
                                <span className="font-body rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-500">
                                  {formatCategory(
                                    program.category
                                  )}
                                </span>
                              )}

                              {program.fundingType && (
                                <span className="font-body rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-soft">
                                  {
                                    program.fundingType
                                  }
                                </span>
                              )}
                            </div>
                          )}

                          {/* Amount */}
                          {program.amountMax && (
                            <div className="mb-3 rounded-2xl bg-sand-50 p-3.5">
                              <div className="font-body flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                                <Wallet size={13} />
                                Montant max
                              </div>

                              <p className="font-display mt-1 text-base font-semibold text-wine-700">
                                {formatAmount(
                                  program.amountMax
                                )}{" "}
                                <span className="font-body text-sm font-medium text-ink-soft">
                                  {program.currency ||
                                    "DZD"}
                                </span>
                              </p>
                            </div>
                          )}

                          {/* Region */}
                          {program.region && (
                            <p className="font-body mb-2 flex items-center gap-1.5 text-sm text-ink-soft">
                              <MapPin
                                size={14}
                                className="text-gold-500"
                              />

                              {program.region}
                            </p>
                          )}

                          {/* Description */}
                          {program.shortDescription && (
                            <p className="font-body mt-1 line-clamp-3 text-sm leading-6 text-ink-soft">
                              {
                                program.shortDescription
                              }
                            </p>
                          )}

                          <div className="flex-1" />

                          {/* Footer */}
                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-rose-100/60 pt-4">
                            <DeadlineTag
                              closingDate={
                                program.closingDate
                              }
                            />

                            {alreadyApplied ? (
                              <span className="font-body inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
                                <CheckCircle2
                                  size={14}
                                />
                                Déjà postulé
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openApplyModal(
                                    program
                                  )
                                }
                                className="focus-ring font-body rounded-xl bg-rise-gradient px-4 py-2 text-xs font-semibold text-white shadow-bloom transition hover:brightness-105"
                              >
                                Postuler
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </>
        )}

        {/* ===================================================== */}
        {/* MY APPLICATIONS */}
        {/* ===================================================== */}

        {activeTab === "mine" && (
          <>
            {myAppsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-[2rem] bg-sand-100"
                  />
                ))}
              </div>
            )}

            {!myAppsLoading && myAppsError && (
              <div className="font-body rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-wine-700">
                {myAppsError}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      void loadMyApplications()
                    }
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
                <div className="animate-rise flex flex-col items-center rounded-[2rem] border border-dashed border-rose-200 bg-white/60 px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                    <ListChecks size={22} />
                  </div>

                  <p className="font-script text-xl text-rose-500">
                    Aucune candidature pour
                    l&apos;instant
                  </p>

                  <p className="font-body mt-2 max-w-sm text-sm text-ink-soft">
                    Parcourez les programmes
                    disponibles et postulez pour les
                    voir apparaître ici.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab("all")
                    }
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
                  {myApplications.map(
                    (application) => (
                      <div
                        key={application.id}
                        className="animate-rise flex flex-col gap-4 rounded-[2rem] border border-rose-100/70 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-semibold text-ink">
                            {application.program
                              ?.title ||
                              "Programme"}
                          </h3>

                          <div className="font-body mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                            {application.program
                              ?.institution
                              ?.name && (
                              <span>
                                {
                                  application
                                    .program
                                    .institution
                                    .name
                                }
                              </span>
                            )}

                            {application.program
                              ?.category && (
                              <span>
                                {formatCategory(
                                  application
                                    .program
                                    .category
                                )}
                              </span>
                            )}

                            <span>
                              Postulé le{" "}
                              {formatDate(
                                application.createdAt
                              )}
                            </span>

                            {application.amountRequested !==
                              undefined && (
                              <span>
                                {formatAmount(
                                  application.amountRequested
                                )}{" "}
                                {application
                                  .program
                                  ?.currency ||
                                  "DZD"}{" "}
                                demandés
                              </span>
                            )}
                          </div>
                        </div>

                        <ApplicationStatusBadge
                          status={
                            application.status
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              )}
          </>
        )}
      </div>

      {/* ===================================================== */}
      {/* APPLICATION MODAL */}
      {/* ===================================================== */}

      {applyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-modal-title"
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-bloom"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-script text-lg leading-none text-rose-500">
                  Candidature
                </p>

                <h3
                  id="application-modal-title"
                  className="font-display mt-2 text-xl font-bold text-wine-700"
                >
                  {applyTarget.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-ink-soft transition hover:bg-sand-100 disabled:opacity-50"
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
                  onChange={(event) =>
                    setAmountRequested(
                      event.target.value
                    )
                  }
                  placeholder="Ex : 500000"
                  className="w-full rounded-xl border border-rose-100/70 bg-sand-50 p-3 text-ink outline-none transition focus:border-rose-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Message pour l&apos;institution
                  (optionnel)
                </label>

                <textarea
                  rows={4}
                  value={applyMessage}
                  onChange={(event) =>
                    setApplyMessage(
                      event.target.value
                    )
                  }
                  placeholder="Présentez brièvement votre projet…"
                  className="w-full resize-none rounded-xl border border-rose-100/70 bg-sand-50 p-3 text-ink outline-none transition focus:border-rose-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-ink disabled:opacity-60"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() =>
                  void submitApplication()
                }
                disabled={applying}
                className="inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applying && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {applying
                  ? "Envoi…"
                  : "Envoyer ma candidature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
