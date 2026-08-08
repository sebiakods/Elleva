"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const CATEGORIES = [
  { value: "BANK_LOAN", label: "Bank Loan" },
  { value: "ISLAMIC_FINANCE", label: "Islamic Finance" },
  { value: "GOVERNMENT_GRANT", label: "Government Grant" },
  { value: "STARTUP_FUNDING", label: "Startup Funding" },
];

export default function EditInstitutionProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("BANK_LOAN");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

const loadProgram = useCallback(async () => {
  if (!id) {
    setLoadError("Program ID is missing.");
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setLoadError(null);

    const token = window.localStorage.getItem("accessToken");

    if (!token) {
      setLoadError("Authentication required. Please log in again.");
      return;
    }

    const url = `${API}/institution/programs/${encodeURIComponent(id)}`;

    console.log("🔵 GET PROGRAM:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const json = await response.json();

    console.log("🟢 PROGRAM STATUS:", response.status);
    console.log("🟢 PROGRAM RESPONSE:", json);
    console.log("🟢 PROGRAM DATA:", json?.data);

    if (!response.ok) {
      setLoadError(
        json?.message ||
          json?.error ||
          `Failed to load program (${response.status})`
      );
      return;
    }

    const program = json?.data;

    if (!program) {
      setLoadError("Program data is missing from the server response.");
      return;
    }

    console.log("✅ PROGRAM TO FORM:", program);

    setTitle(program.title ?? "");
    setDescription(program.description ?? "");

    setCategory(
      program.category ?? "BANK_LOAN"
    );

    setAmountMin(
      program.amountMin !== null &&
      program.amountMin !== undefined
        ? String(program.amountMin)
        : ""
    );

    setAmountMax(
      program.amountMax !== null &&
      program.amountMax !== undefined
        ? String(program.amountMax)
        : ""
    );

    setIsPublished(
      Boolean(program.isPublished)
    );
  } catch (err) {
    console.error("❌ LOAD PROGRAM ERROR:", err);

    setLoadError(
      "Failed to connect to the server."
    );
  } finally {
    setLoading(false);
  }
}, [id]);
  useEffect(() => {
    if (id) loadProgram();
  }, [id, loadProgram]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a program title.");
      return;
    }

    if (
      amountMin &&
      amountMax &&
      Number(amountMin) > Number(amountMax)
    ) {
      setError("Minimum amount can't be greater than maximum amount.");
      return;
    }

    const token = window.localStorage.getItem("accessToken");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API}/institution/programs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          slug: title.toLowerCase().trim().replace(/\s+/g, "-"),
          description,
          category,
          amountMin: Number(amountMin),
          amountMax: Number(amountMax),
          isPublished,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Update failed. Please try again.");
        return;
      }

      router.push(`/institution/programs/${id}`);
    } catch (err) {
      console.error("Update program error:", err);
      setError("Failed to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-sand-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
          <p className="font-body text-sm text-ink-soft">
            Loading program…
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-sand-50 p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/institution/programs"
            className="focus-ring font-body inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-rose-500"
          >
            ← Back to Programs
          </Link>

          <div className="font-body mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-wine-700">
            {loadError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href={`/institution/programs/${id}`}
          className="focus-ring font-body inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-rose-500"
        >
          ← Back to Program
        </Link>

        {/* Header */}
        <div className="mt-4 mb-8">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            Institution Dashboard
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-wine-700 md:text-4xl">
            Edit Financing Program
          </h1>
          <p className="font-body mt-2 text-ink-soft">
            Update the details below. Changes are saved once you submit.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="card-surface animate-rise space-y-6 p-6 shadow-card md:p-8"
        >
          {error && (
            <div className="font-body rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-wine-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="font-body mb-1.5 block text-sm font-semibold text-ink"
            >
              Program title
            </label>
            <input
              id="title"
              className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white"
              placeholder="e.g. Women in Tech Startup Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="font-body mb-1.5 block text-sm font-semibold text-ink"
            >
              Description
            </label>
            <textarea
              id="description"
              className="focus-ring font-body w-full resize-none rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white"
              rows={5}
              placeholder="Describe who this program is for and what it covers…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="font-body mb-1.5 block text-sm font-semibold text-ink"
            >
              Category
            </label>
            <select
              id="category"
              className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink transition focus:border-rose-400 focus:bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount range */}
          <div>
            <span className="font-body mb-1.5 block text-sm font-semibold text-ink">
              Funding amount
            </span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 pr-14 text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white"
                  placeholder="Minimum"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                />
                <span className="font-body pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft">
                  DZD
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 pr-14 text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white"
                  placeholder="Maximum"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                />
                <span className="font-body pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft">
                  DZD
                </span>
              </div>
            </div>
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between rounded-xl bg-sand-100 p-4">
            <div>
              <p className="font-body text-sm font-semibold text-ink">
                Published
              </p>
              <p className="font-body mt-0.5 text-xs text-ink-soft">
                Visible to entrepreneurs when published.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPublished((v) => !v)}
              aria-pressed={isPublished}
              className={`focus-ring relative h-7 w-12 shrink-0 rounded-full transition ${
                isPublished ? "bg-rise-gradient" : "bg-sand-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-card transition ${
                  isPublished ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-sand-200 pt-6">
            <Link
              href={`/institution/programs/${id}`}
              className="focus-ring font-body rounded-xl px-5 py-3 text-sm font-semibold text-ink-soft transition hover:text-ink"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring font-body inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-6 py-3 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}