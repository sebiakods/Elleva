"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Heart,
  Calculator,
  TrendingUp,
  Search,
  Calendar,
  Building2,
  Wallet,
  MapPin,
  CheckCircle2,
  X,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useCurrentUser } from "@/hooks/useCurrentUser";


const API_URL = '/api';

interface Program {
  id: string;
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
  institution?: {
    name?: string;
  };
}

interface MyApplication {
  id: string;
  programId?: string;
  program?: {
    id?: string;
  };
  status?: string;
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

const filters = [
  "Tous",
  "Startup",
  "Agriculture",
  "Artisanat",
  "Innovation",
  "Formation",
];

export default function DashboardHome() {
  const { user, loading: userLoading } = useCurrentUser();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("Tous");
  const [search, setSearch] = useState("");

  const [appliedIds, setAppliedIds] = useState<Set<string>>(
    new Set()
  );

  const [applyTarget, setApplyTarget] =
    useState<Program | null>(null);

  const [amountRequested, setAmountRequested] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  /*
   * Authentication:
   * We no longer read accessToken/token from localStorage.
   *
   * The backend authentication cookie is sent automatically
   * because every authenticated request uses:
   *
   * credentials: "include"
   */

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/programs`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const json = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Vous n'avez pas accès à cette ressource."
        );
      }

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            "Erreur lors du chargement des programmes."
        );
      }

      const items: Program[] =
        json.items ||
        json.data ||
        json.programs ||
        [];

      setPrograms(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("LOAD PROGRAMS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des programmes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyApplications = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/my/applications`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        setAppliedIds(new Set());
        return;
      }

      if (!response.ok) {
        return;
      }

      const json = await response.json().catch(() => ({}));

      const items: MyApplication[] =
        json.items ||
        json.data ||
        json.applications ||
        [];

      const ids = new Set<string>();

      if (Array.isArray(items)) {
        items.forEach((application) => {
          const programId =
            application.program?.id ||
            application.programId;

          if (programId) {
            ids.add(String(programId));
          }
        });
      }

      setAppliedIds(ids);
    } catch (err) {
      console.error(
        "LOAD MY APPLICATIONS ERROR:",
        err
      );
    }
  }, []);

  useEffect(() => {
    void loadPrograms();
    void loadMyApplications();
  }, [loadPrograms, loadMyApplications]);

  const displayedPrograms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return programs.filter((program) => {
      const category = formatCategory(program.category);

      const matchesFilter =
        activeFilter === "Tous" ||
        category === activeFilter ||
        program.category === activeFilter;

      const matchesSearch =
        !normalizedSearch ||
        program.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        program.shortDescription
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        program.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        program.institution?.name
          ?.toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [programs, activeFilter, search]);

  function openApplyModal(program: Program) {
    setApplyTarget(program);
    setAmountRequested("");
    setApplyMessage("");
    setApplyError("");
  }

  function closeApplyModal() {
    if (applying) return;

    setApplyTarget(null);
    setAmountRequested("");
    setApplyMessage("");
    setApplyError("");
  }

  async function submitApplication() {
    if (!applyTarget) return;

    try {
      setApplying(true);
      setApplyError("");

      const response = await fetch(
        `${API_URL}/programs/${applyTarget.id}/apply`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountRequested: amountRequested.trim()
              ? Number(amountRequested)
              : undefined,
            message: applyMessage.trim() || undefined,
          }),
        }
      );

      const json = await response
        .json()
        .catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Vous n'avez pas l'autorisation de postuler."
        );
      }

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Échec de la candidature (${response.status}).`
        );
      }

      setAppliedIds((current) => {
        const next = new Set(current);
        next.add(applyTarget.id);
        return next;
      });

      closeApplyModal();
    } catch (err) {
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

  const firstName =
    user?.name?.trim().split(/\s+/)[0] ?? "";

  return (
    <>
      <Header
        title={
          userLoading
            ? "Bonjour"
            : firstName
              ? `Bonjour, ${firstName}`
              : "Bonjour"
        }
      />

      <StatsCards
        items={[
          {
            label: "Business plans",
            value: "3",
            icon: FileText,
            tone: "rose",
          },
          {
            label: "Programmes favoris",
            value: "7",
            icon: Heart,
            tone: "wine",
          },
          {
            label: "Simulations effectuées",
            value: "12",
            icon: Calculator,
            tone: "gold",
          },
          {
            label: "Progression globale",
            value: "68%",
            icon: TrendingUp,
            tone: "rose",
          },
        ]}
      />

      <section className="mt-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">
              Programmes de financement
            </h2>

            <p className="mt-2 text-ink-soft">
              Découvrez toutes les opportunités de financement
              publiées par nos institutions partenaires. L&apos;accès
              est gratuit pour toutes les entrepreneuses.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50"
              size={18}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher un programme..."
              aria-label="Rechercher un programme"
              className="h-12 w-full rounded-2xl border border-sand-200 bg-white pl-11 pr-4 text-ink outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-rise-gradient text-white shadow-bloom"
                  : "border border-sand-200 bg-white text-ink-soft hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-xl2 bg-sand-100"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-wine-700">
            <p>{error}</p>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => void loadPrograms()}
                className="rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          displayedPrograms.length === 0 && (
            <div className="flex flex-col items-center rounded-xl2 border border-sand-200 bg-white p-14 text-center shadow-card">
              <h3 className="font-display text-2xl font-semibold text-wine-700">
                Aucun programme trouvé
              </h3>

              <p className="mt-2 max-w-sm text-ink-soft">
                Essayez d&apos;ajuster votre recherche ou revenez
                plus tard pour découvrir de nouveaux programmes.
              </p>

              {(search || activeFilter !== "Tous") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("Tous");
                  }}
                  className="mt-5 rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          displayedPrograms.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {displayedPrograms.map((program, index) => {
                const alreadyApplied = appliedIds.has(
                  program.id
                );

                return (
                  <article
                    key={program.id}
                    style={{
                      animationDelay: `${index * 80}ms`,
                    }}
                    className="group relative flex animate-rise flex-col overflow-hidden rounded-xl2 border border-sand-200 bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-bloom"
                  >
                    <div className="space-y-4 p-6">
                      <div className="min-w-0">
                        <span className="rounded-full bg-rise-gradient-soft px-3 py-1 text-xs font-semibold text-rose-600">
                          {formatCategory(program.category) ||
                            "Programme"}
                        </span>

                        <h3 className="font-display mt-3 text-xl font-bold leading-tight text-ink">
                          {program.title}
                        </h3>

                        {program.institution?.name && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                            <Building2 size={15} />
                            {program.institution.name}
                          </div>
                        )}
                      </div>

                      {program.shortDescription && (
                        <p className="line-clamp-3 text-sm leading-6 text-ink-soft">
                          {program.shortDescription}
                        </p>
                      )}

                      <div className="rounded-xl2 bg-sand-50 p-4">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-soft/70">
                          <Wallet size={13} />
                          Financement
                        </p>

                        <p className="font-display mt-2 text-lg font-bold text-ink">
                          {formatAmount(program.amountMin)}{" "}
                          –{" "}
                          {formatAmount(program.amountMax)}{" "}
                          <span className="text-sm font-medium text-ink-soft">
                            {program.currency || "DZD"}
                          </span>
                        </p>
                      </div>

                      {program.region && (
                        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                          <MapPin
                            size={14}
                            className="text-gold-500"
                          />
                          {program.region}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-sand-200 p-6 pt-4">
                      {program.closingDate ? (
                        <span className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                          <Calendar size={14} />
                          {formatDate(program.closingDate)}
                        </span>
                      ) : (
                        <span />
                      )}

                      {alreadyApplied ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                          <CheckCircle2 size={16} />
                          Déjà postulé
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openApplyModal(program)
                          }
                          className="rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
                        >
                          Postuler
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentActivity />
        </div>

        <div className="space-y-6">
          <QuickActions />
          <NotificationPanel />
        </div>
      </div>

      {applyTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-bloom">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Candidature
                </p>

                <h3
                  id="application-modal-title"
                  className="font-display mt-1 text-xl font-bold text-wine-700"
                >
                  {applyTarget.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                aria-label="Fermer"
                className="shrink-0 rounded-lg p-1.5 text-ink-soft transition hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                <label
                  htmlFor="amountRequested"
                  className="mb-1.5 block text-sm font-semibold text-ink"
                >
                  Montant demandé (optionnel)
                </label>

                <input
                  id="amountRequested"
                  type="number"
                  min={0}
                  value={amountRequested}
                  onChange={(event) =>
                    setAmountRequested(event.target.value)
                  }
                  placeholder="Ex : 500000"
                  className="w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink outline-none transition focus:border-rose-400 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="applyMessage"
                  className="mb-1.5 block text-sm font-semibold text-ink"
                >
                  Message pour l&apos;institution (optionnel)
                </label>

                <textarea
                  id="applyMessage"
                  rows={4}
                  value={applyMessage}
                  onChange={(event) =>
                    setApplyMessage(event.target.value)
                  }
                  placeholder="Présentez brièvement votre projet…"
                  className="w-full resize-none rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink outline-none transition focus:border-rose-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => void submitApplication()}
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
    </>
  );
}
