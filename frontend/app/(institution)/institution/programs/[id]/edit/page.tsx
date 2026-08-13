"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const CATEGORIES = [
  { value: "BANK_LOAN", label: "Bank Loan" },
  { value: "ISLAMIC_FINANCE", label: "Islamic Finance" },
  { value: "GOVERNMENT_GRANT", label: "Government Grant" },
  { value: "STARTUP_FUNDING", label: "Startup Funding" },
];

interface Program {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  amountMin?: string | number | null;
  amountMax?: string | number | null;
  isPublished?: boolean;
}

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

export default function EditInstitutionProgramPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;

  const id = Array.isArray(rawId)
    ? rawId[0]
    : typeof rawId === "string"
      ? rawId
      : "";

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

  /*
   * We intentionally load from the working
   * institution list endpoint.
   *
   * This avoids the BigInt serialization
   * problem currently present in the direct
   * GET /institution/programs/:id endpoint.
   */
  const loadProgram = useCallback(async () => {
    if (!id) {
      setLoadError("Program ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      const token = getToken();

      if (!token) {
        setLoadError("Authentication required. Please log in again.");
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

      const programs: Program[] = Array.isArray(json)
        ? json
        : json.data || json.items || json.programs || [];

      const program = programs.find(
        (item) => String(item.id) === String(id)
      );

      if (!program) {
        throw new Error(
          "Program not found or you do not have access to it."
        );
      }

      setTitle(program.title ?? "");
      setDescription(program.description ?? "");

      setCategory(
        program.category &&
          CATEGORIES.some((item) => item.value === program.category)
          ? program.category
          : "BANK_LOAN"
      );

      setAmountMin(
        program.amountMin !== null && program.amountMin !== undefined
          ? String(program.amountMin)
          : ""
      );

      setAmountMax(
        program.amountMax !== null && program.amountMax !== undefined
          ? String(program.amountMax)
          : ""
      );

      setIsPublished(Boolean(program.isPublished));
    } catch (err) {
      console.error("LOAD PROGRAM ERROR:", err);

      setLoadError(
        err instanceof Error ? err.message : "Failed to load program."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError("Please enter a program title.");
      return;
    }

    const min = amountMin.trim() === "" ? null : Number(amountMin);
    const max = amountMax.trim() === "" ? null : Number(amountMax);

    if (min !== null && Number.isNaN(min)) {
      setError("Minimum amount must be a valid number.");
      return;
    }

    if (max !== null && Number.isNaN(max)) {
      setError("Maximum amount must be a valid number.");
      return;
    }

    if (min !== null && min < 0) {
      setError("Minimum amount cannot be negative.");
      return;
    }

    if (max !== null && max < 0) {
      setError("Maximum amount cannot be negative.");
      return;
    }

    if (min !== null && max !== null && min > max) {
      setError("Minimum amount cannot be greater than maximum amount.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      // Safe slug generation with diacritics stripping & fallback
      const generatedSlug = cleanTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const slug = generatedSlug || `program-${Date.now()}`;

      const response = await fetch(
        `${API}/institution/programs/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            title: cleanTitle,
            slug,
            description: cleanDescription,
            category,
            amountMin: min,
            amountMax: max,
            isPublished,
          }),
        }
      );

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Invalid update response:", text);
      }

      console.log("UPDATE PROGRAM:", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        setError(
          data?.message ||
            data?.error ||
            `Update failed (${response.status}).`
        );
        return;
      }

      router.push(`/institution/programs/${id}`);
      router.refresh();
    } catch (err) {
      console.error("UPDATE PROGRAM ERROR:", err);

      setError("Failed to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50">
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
            className="font-body inline-flex items-center text-sm font-medium text-ink-soft hover:text-rose-500"
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
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/institution/programs/${id}`}
          className="font-body inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-rose-500"
        >
          ← Back to Program
        </Link>

        <div className="mb-8 mt-4">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            Institution Dashboard
          </p>

          <h1 className="font-display mt-1 text-3xl font-semibold text-wine-700 md:text-4xl">
            Edit Financing Program
          </h1>

          <p className="font-body mt-2 text-ink-soft">
            Update the details below.
          </p>
        </div>

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
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white"
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
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="focus-ring font-body w-full resize-none rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink transition focus:border-rose-400 focus:bg-white"
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink transition focus:border-rose-400 focus:bg-white"
            >
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <span className="font-body mb-1.5 block text-sm font-semibold text-ink">
              Funding amount
            </span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  placeholder="Minimum"
                  className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 pr-14 text-ink"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs font-semibold text-ink-soft">
                  DZD
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                  placeholder="Maximum"
                  className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 pr-14 text-ink"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs font-semibold text-ink-soft">
                  DZD
                </span>
              </div>
            </div>
          </div>

          {/* Published */}
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
              onClick={() => setIsPublished((value) => !value)}
              aria-pressed={isPublished}
              className={`relative h-7 w-12 rounded-full transition ${
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
          <div className="flex justify-end gap-3 border-t border-sand-200 pt-6">
            <Link
              href={`/institution/programs/${id}`}
              className="font-body rounded-xl px-5 py-3 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="font-body inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-6 py-3 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
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