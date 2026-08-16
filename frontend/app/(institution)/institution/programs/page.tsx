"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Edit3,
  Eye,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface FinancingProgram {
  id: string;
  title: string;
  category: string;
  region?: string | null;
  amountMin: string | number;
  amountMax: string | number;
  currency: string;
  isPublished: boolean;
  isArchived: boolean;
}

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

function formatAmount(value: string | number) {
  const num = Number(value);

  if (Number.isNaN(num)) {
    return String(value);
  }

  return num.toLocaleString("fr-FR");
}

function formatCategory(category: string) {
  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function InstitutionProgramsPage() {
  const [programs, setPrograms] = useState<FinancingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      if (!token) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
        setPrograms([]);
        return;
      }

      const response = await fetch(`${API}/institution/programs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const text = await response.text();

      let json: any = {};

      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "Le serveur a retourné une réponse invalide."
        );
      }

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Impossible de charger les programmes (${response.status})`
        );
      }

      const items = Array.isArray(json)
        ? json
        : json.data ||
          json.items ||
          json.programs ||
          [];

      setPrograms(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("LOAD PROGRAMS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de se connecter au serveur."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  async function deleteProgram(id: string) {
    const program = programs.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer « ${
        program?.title || "ce programme"
      } » ?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = getToken();

      if (!token) {
        alert(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
        return;
      }

      const response = await fetch(
        `${API}/institution/programs/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      let json: any = {};

      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        // Ignore invalid JSON
      }

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Impossible de supprimer le programme (${response.status})`
        );
      }

      setPrograms((current) =>
        current.filter(
          (program) => program.id !== id
        )
      );
    } catch (err) {
      console.error("DELETE PROGRAM ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le programme."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* -------------------------------------------------------------- */
  /* Loading                                                         */
  /* -------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-pulse rounded-full bg-rose-100" />

              <Sparkles
                size={22}
                className="relative text-rose-500"
              />
            </div>

            <p className="font-body text-sm text-ink-soft">
              Chargement de vos programmes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 px-6 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ====================================================== */}
        {/* HEADER                                                  */}
        {/* ====================================================== */}

        <div className="mb-10">
          {/* Breadcrumb */}
          <div className="mb-8 text-sm text-ink-soft">
            <span>Espace Institution</span>

            <span className="mx-2 text-ink-soft/40">
              /
            </span>

            <span className="font-medium text-wine-700">
              Programmes
            </span>
          </div>

          {/* Header content */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl"
            />

            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-script text-2xl leading-none text-rose-500">
                  Vos programmes
                </p>

                <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
                  Gestion -{" "}
                  <span className="text-gradient-rise">
                    Programmes
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
                  Créez et gérez les programmes de financement
                  proposés par votre institution aux
                  entrepreneures.
                </p>
              </div>

              <Link
                href="/institution/programs/new"
                className="focus-ring group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-rise-gradient px-5 py-3.5 font-body text-sm font-semibold text-white shadow-bloom transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
              >
                <Plus
                  size={17}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />

                Créer un programme

                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* ERROR                                                    */}
        {/* ====================================================== */}

        {error && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-body text-sm font-medium text-wine-700">
                {error}
              </p>

              <p className="mt-1 text-xs text-ink-soft">
                Vérifiez votre connexion puis réessayez.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPrograms}
              className="rounded-xl bg-white px-4 py-2.5 font-body text-sm font-semibold text-wine-700 shadow-sm transition hover:bg-rose-50"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ====================================================== */}
        {/* EMPTY STATE                                              */}
        {/* ====================================================== */}

        {!error && programs.length === 0 && (
          <div className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-white px-6 py-16 text-center shadow-card md:px-12">
            {/* Decorative circles */}
            <div
              aria-hidden
              className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-rose-100/60 blur-3xl"
            />

            <div
              aria-hidden
              className="absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-pink-100/50 blur-3xl"
            />

            <div className="relative">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rise-gradient-soft shadow-sm">
                <Sparkles
                  size={25}
                  className="text-rose-500"
                />
              </div>

              <p className="font-script text-xl text-rose-500">
                Commencez ici
              </p>

              <h2 className="mt-1 font-display text-2xl font-semibold text-wine-900">
                Aucun programme pour le moment
              </h2>

              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-ink-soft">
                Créez votre premier programme de financement
                pour permettre aux entrepreneures de découvrir
                vos opportunités.
              </p>

              <Link
                href="/institution/programs/new"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-rise-gradient px-6 py-3 font-body text-sm font-semibold text-white shadow-bloom transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <Plus size={17} />
                Créer mon premier programme
              </Link>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* PROGRAMS                                                 */}
        {/* ====================================================== */}

        {programs.length > 0 && (
          <>
            {/* Small section heading */}
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="font-script text-lg text-rose-500">
                  Votre catalogue
                </p>

                <h2 className="font-display text-2xl font-semibold text-wine-900">
                  Programmes disponibles
                </h2>
              </div>

              <span className="rounded-full border border-rose-100 bg-white px-3 py-1.5 font-body text-xs font-semibold text-wine-600 shadow-sm">
                {programs.length}{" "}
                {programs.length > 1
                  ? "programmes"
                  : "programme"}
              </span>
            </div>

            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((program, index) => (
                <div
                  key={program.id}
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                  className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-rose-100/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-200 hover:shadow-bloom"
                >
                  {/* Top decorative area */}
                  <div className="relative h-28 overflow-hidden bg-rise-gradient-soft">
                    <div
                      aria-hidden
                      className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/30 blur-2xl"
                    />

                    <div
                      aria-hidden
                      className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-rose-200/30 blur-2xl"
                    />

                    <div className="absolute left-5 top-5 flex items-center gap-2">
                      <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1.5 font-body text-[11px] font-semibold text-wine-700 shadow-sm backdrop-blur-sm">
                        {formatCategory(
                          program.category
                        )}
                      </span>
                    </div>

                    <div className="absolute right-5 top-5">
                      <span
                        className={`rounded-full border px-3 py-1.5 font-body text-[11px] font-semibold shadow-sm backdrop-blur-sm ${
                          program.isPublished
                            ? "border-emerald-200 bg-white/85 text-emerald-700"
                            : "border-amber-200 bg-white/85 text-amber-700"
                        }`}
                      >
                        {program.isPublished
                          ? "Publié"
                          : "Brouillon"}
                      </span>
                    </div>

                    <div className="absolute bottom-[-18px] left-5 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-white text-rose-500 shadow-md">
                      <Wallet size={19} />
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex flex-1 flex-col p-5 pt-7">
                    {/* Title */}
                    <div>
                      <h3 className="font-display text-xl font-semibold leading-snug text-wine-900 transition-colors group-hover:text-rose-600">
                        {program.title}
                      </h3>

                      <div className="mt-3 h-px w-12 bg-gradient-to-r from-rose-300 to-transparent" />
                    </div>

                    {/* Funding */}
                    <div className="mt-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 to-sand-50 p-4">
                      <p className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-rose-500">
                        Montant du financement
                      </p>

                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <p className="font-display text-lg font-semibold text-wine-800">
                          {formatAmount(
                            program.amountMin
                          )}
                        </p>

                        <span className="text-sm text-rose-300">
                          —
                        </span>

                        <p className="font-display text-lg font-semibold text-wine-800">
                          {formatAmount(
                            program.amountMax
                          )}
                        </p>
                      </div>

                      <p className="mt-0.5 font-body text-xs font-medium text-ink-soft">
                        {program.currency}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="mt-4 space-y-3">
                      {program.region ? (
                        <div className="flex items-center gap-2.5 text-sm text-ink-soft">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                            <MapPin size={15} />
                          </span>

                          <span className="truncate">
                            {program.region}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 text-sm text-ink-soft">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
                            <MapPin size={15} />
                          </span>

                          <span>
                            Toutes les régions
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            program.isArchived
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          <Sparkles size={14} />
                        </span>

                        <span
                          className={`font-body text-sm font-medium ${
                            program.isArchived
                              ? "text-slate-500"
                              : "text-emerald-700"
                          }`}
                        >
                          {program.isArchived
                            ? "Programme archivé"
                            : "Programme actif"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-6">
                      <div className="grid grid-cols-2 gap-2.5">
                        <Link
                          href={`/institution/programs/${program.id}`}
                          className="focus-ring group/button inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2.5 font-body text-xs font-semibold text-wine-700 transition hover:border-rose-300 hover:bg-rose-50"
                        >
                          <Eye
                            size={14}
                            className="transition-transform group-hover/button:scale-110"
                          />
                          Voir
                        </Link>

                        <Link
                          href={`/institution/programs/${program.id}/edit`}
                          className="focus-ring group/button inline-flex items-center justify-center gap-1.5 rounded-xl bg-rise-gradient px-3 py-2.5 font-body text-xs font-semibold text-white shadow-sm transition hover:brightness-105"
                        >
                          <Edit3
                            size={14}
                            className="transition-transform group-hover/button:-rotate-6"
                          />
                          Modifier
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteProgram(program.id)
                        }
                        disabled={
                          deletingId === program.id
                        }
                        className="focus-ring group/delete mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2.5 font-body text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2
                          size={14}
                          className="transition-transform group-hover/delete:scale-110"
                        />

                        {deletingId === program.id
                          ? "Suppression..."
                          : "Supprimer"}
                      </button>
                    </div>
                  </div>

                  {/* Bottom decorative line */}
                  <div className="h-1 w-full bg-rise-gradient opacity-70" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}