"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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
        setError("Authentication required. Please log in again.");
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
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Failed to load programs (${response.status})`
        );
      }

      const items = Array.isArray(json)
        ? json
        : json.data || json.items || json.programs || [];

      setPrograms(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("LOAD PROGRAMS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  async function deleteProgram(id: string) {
    const program = programs.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        program?.title || "this program"
      }"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = getToken();

      if (!token) {
        alert("Your session has expired. Please log in again.");
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
            `Failed to delete program (${response.status})`
        );
      }

      setPrograms((current) =>
        current.filter((program) => program.id !== id)
      );
    } catch (err) {
      console.error("DELETE PROGRAM ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete the program."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
          <p className="font-body text-sm text-ink-soft">
            Loading programs…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-sand-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
              Institution Dashboard
            </p>

            <h1 className="font-display mt-1 text-3xl font-semibold text-wine-700 md:text-4xl">
              Financing Programs
            </h1>

            <p className="font-body mt-2 text-ink-soft">
              Manage the funding programs your institution offers.
            </p>
          </div>

          <Link
            href="/institution/programs/new"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-rise-gradient px-5 py-3 font-body text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
          >
            <span className="text-lg leading-none">+</span>
            Create Program
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="font-body text-sm text-wine-700">
              {error}
            </p>

            <button
              onClick={loadPrograms}
              className="font-body rounded-lg bg-white px-4 py-2 text-sm font-semibold text-wine-700 shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!error && programs.length === 0 && (
          <div className="card-surface flex flex-col items-center p-14 text-center shadow-card">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rise-gradient-soft text-2xl text-rose-500">
              +
            </div>

            <h2 className="font-display text-2xl font-semibold text-wine-700">
              No programs yet
            </h2>

            <p className="font-body mt-2 max-w-md text-ink-soft">
              Create your first financing program so entrepreneurs
              can discover and apply for it.
            </p>

            <Link
              href="/institution/programs/new"
              className="mt-7 rounded-xl bg-rise-gradient px-6 py-3 font-body text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
            >
              Create Program
            </Link>
          </div>
        )}

        {/* Programs */}
        {programs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, index) => (
              <div
                key={program.id}
                style={{ animationDelay: `${index * 60}ms` }}
                className="card-surface animate-rise group flex flex-col p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-bloom"
              >
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-wine-100 px-3 py-1 font-body text-xs font-semibold text-wine-500">
                      {formatCategory(program.category)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${
                        program.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-gold-400/20 text-gold-500"
                      }`}
                    >
                      {program.isPublished
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-semibold leading-snug text-ink">
                    {program.title}
                  </h2>
                </div>

                <div className="mt-5 rounded-xl bg-sand-100 p-4">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Funding Amount
                  </p>

                  <p className="font-display mt-1 text-lg font-semibold text-wine-700">
                    {formatAmount(program.amountMin)} –{" "}
                    {formatAmount(program.amountMax)}{" "}
                    <span className="font-body text-sm font-medium text-ink-soft">
                      {program.currency}
                    </span>
                  </p>
                </div>

                {program.region && (
                  <p className="font-body mt-4 text-sm text-ink-soft">
                    📍 {program.region}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${
                      program.isArchived
                        ? "bg-rose-100 text-wine-700"
                        : "bg-wine-100 text-wine-500"
                    }`}
                  >
                    {program.isArchived ? "Archived" : "Active"}
                  </span>
                </div>

                <div className="flex-1" />

                <div className="mt-6 flex gap-3 border-t border-sand-200 pt-5">
                  <Link
                    href={`/institution/programs/${program.id}`}
                    className="focus-ring flex-1 rounded-lg border border-wine-500 px-4 py-2.5 text-center font-body text-sm font-semibold text-wine-500 transition hover:bg-wine-500 hover:text-white"
                  >
                    View
                  </Link>

                  <Link
                    href={`/institution/programs/${program.id}/edit`}
                    className="focus-ring flex-1 rounded-lg bg-rise-gradient px-4 py-2.5 text-center font-body text-sm font-semibold text-white transition hover:brightness-105"
                  >
                    Edit
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => deleteProgram(program.id)}
                  disabled={deletingId === program.id}
                  className="focus-ring mt-3 w-full rounded-lg bg-rose-500 px-4 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === program.id
                    ? "Deleting…"
                    : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}