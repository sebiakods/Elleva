"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/* =========================================================
   TYPES
========================================================= */

interface FinancingProgram {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description: string;
  category: string;

  sector?: string | null;
  fundingType?: string | null;

  amountMin: string | number | bigint;
  amountMax: string | number | bigint;
  currency: string;

  openingDate?: string | null;
  closingDate?: string | null;

  region?: string | null;
  targetAudience?: string | null;

  eligibility: string[];
  requiredDocuments: string[];

  website?: string | null;
  email?: string | null;
  phone?: string | null;

  isPublished: boolean;
  isArchived: boolean;

  createdAt: string;
  updatedAt: string;

  _count?: {
    applications?: number;
  };

  applicationsCount?: number;
}

interface Applicant {
  id?: string;
  name?: string;
  email?: string;
}

interface ProgramApplication {
  id: string;
  applicantId: string;
  applicant?: Applicant;
  status: string;
  amountRequested?: string | number | bigint;
  createdAt: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface ProgramsResponse {
  data?: FinancingProgram[];
  programs?: FinancingProgram[];
  items?: FinancingProgram[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* =========================================================
   HELPERS
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Support both names in case the authentication system
  // changed between versions.
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function formatDate(date?: string | null): string {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(value: string | number | bigint): string {
  if (value === null || value === undefined) {
    return "0";
  }

  try {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num.toLocaleString("en-US");
    }
    return value.toString();
  } catch {
    return String(value);
  }
}

function formatAmountRange(
  min: string | number | bigint,
  max: string | number | bigint,
  currency: string
): string {
  return `${formatAmount(min)} - ${formatAmount(max)} ${currency}`;
}

function cleanCategory(category: string): string {
  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* =========================================================
   BADGES
========================================================= */

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="font-body inline-flex items-center rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-500">
      {cleanCategory(category)}
    </span>
  );
}

function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`font-body inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        published
          ? "bg-green-100 text-green-700"
          : "bg-gold-400/20 text-gold-500"
      }`}
    >
      <span
        className={`mr-2 h-1.5 w-1.5 rounded-full ${
          published ? "bg-green-500" : "bg-gold-500"
        }`}
      />

      {published ? "Published" : "Draft"}
    </span>
  );
}

function ArchiveBadge({ archived }: { archived: boolean }) {
  if (!archived) return null;

  return (
    <span className="font-body inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-wine-700">
      Archived
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

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
      {cleanStatus(status)}
    </span>
  );
}

/* =========================================================
   ICONS
========================================================= */

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M15 9.5c-.6-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 2 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.4-.5-3-1.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function InstitutionProgramDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const id = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

  const [program, setProgram] =
    useState<FinancingProgram | null>(null);

  const [applications, setApplications] =
    useState<ProgramApplication[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [applicationsLoading, setApplicationsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [applicationsError, setApplicationsError] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  /* =======================================================
     LOAD PROGRAM
     
     IMPORTANT:
     We intentionally use:
       GET /institution/programs
     
     instead of:
       GET /institution/programs/:id
     
     because your detail endpoint currently returns Prisma
     BigInt directly and causes:
     
       Do not know how to serialize a BigInt
     
     The list endpoint already returns HTTP 200.
  ======================================================= */

  const loadProgram = useCallback(async () => {
    if (!id) {
      setError("Program ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      if (!token) {
        setError(
          "Your session has expired. Please log in again."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API}/institution/programs`,
        {
          method: "GET",
          headers: getAuthHeaders(),

          // Prevent Next.js/browser caching from returning
          // stale program data.
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please log in again."
        );
      }

      if (!response.ok) {
        const text = await response.text();

        let message = `Failed to load programs (${response.status})`;

        try {
          const json = JSON.parse(text);
          message =
            json?.message ||
            json?.error ||
            message;
        } catch {
          // Ignore invalid JSON
        }

        throw new Error(message);
      }

      const json: ProgramsResponse =
        await response.json();

      /*
       * Your API appears to return:
       *
       * {
       *   data: [...]
       * }
       *
       * But we support a few common response shapes too.
       */
      const programs =
        json.data ||
        json.programs ||
        json.items ||
        [];

      const found = programs.find(
        (item) =>
          String(item.id) === String(id) ||
          String(item.slug) === String(id)
      );

      if (!found) {
        throw new Error(
          "Program not found or you do not have access to it."
        );
      }

      setProgram(found);
    } catch (err) {
      console.error(
        "LOAD PROGRAM ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load program."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* =======================================================
     LOAD APPLICATIONS
     
     Applications are optional. If their endpoint fails,
     the program page still loads correctly.
  ======================================================= */

  const loadApplications = useCallback(async () => {
    if (!id) {
      setApplicationsLoading(false);
      return;
    }

    try {
      setApplicationsLoading(true);
      setApplicationsError(null);

      const token = getToken();

      if (!token) {
        setApplications([]);
        setApplicationsLoading(false);
        return;
      }

      const response = await fetch(
        `${API}/institution/programs/${id}/applications`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store",
        }
      );

      /*
       * Applications are not allowed to break the program
       * detail page.
       */
      if (!response.ok) {
        console.warn(
          `Applications request failed: ${response.status}`
        );

        setApplications([]);
        setApplicationsError(
          "Applications could not be loaded."
        );

        return;
      }

      const json: ApiResponse<
        ProgramApplication[]
      > = await response.json();

      setApplications(
        Array.isArray(json.data)
          ? json.data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD APPLICATIONS ERROR:",
        err
      );

      setApplications([]);
      setApplicationsError(
        "Applications could not be loaded."
      );
    } finally {
      setApplicationsLoading(false);
    }
  }, [id]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadProgram();
    loadApplications();
  }, [loadProgram, loadApplications]);

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete() {
    if (!program || deleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${program.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const response = await fetch(
        `${API}/institution/programs/${program.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please log in again."
        );
      }

      if (!response.ok) {
        let message =
          "Failed to delete program.";

        try {
          const json = await response.json();

          message =
            json?.message ||
            json?.error ||
            message;
        } catch {
          // Ignore invalid JSON
        }

        throw new Error(message);
      }

      router.push("/institution/programs");
      router.refresh();
    } catch (err) {
      console.error(
        "DELETE PROGRAM ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete program."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     RETRY
  ======================================================= */

  function handleRetry() {
    loadProgram();
    loadApplications();
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 h-5 w-32 animate-pulse rounded bg-sand-200" />

          <div className="card-surface p-8 shadow-card">
            <div className="h-8 w-2/3 animate-pulse rounded bg-sand-200" />

            <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-sand-200" />

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="h-28 animate-pulse rounded-xl bg-sand-100" />
              <div className="h-28 animate-pulse rounded-xl bg-sand-100" />
              <div className="h-28 animate-pulse rounded-xl bg-sand-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !program) {
    return (
      <div className="min-h-screen bg-sand-50 p-8">
        <div className="mx-auto max-w-xl">
          <div className="card-surface animate-rise p-8 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <span className="text-2xl">!</span>
            </div>

            <h1 className="font-display mt-5 text-xl font-semibold text-wine-700">
              Unable to load program
            </h1>

            <p className="font-body mt-3 text-sm leading-6 text-ink-soft">
              {error || "Program not found."}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={handleRetry}
                className="focus-ring font-body rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
              >
                Try Again
              </button>

              <Link
                href="/institution/programs"
                className="focus-ring font-body rounded-xl border border-sand-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-sand-100"
              >
                Back to Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     SUCCESS PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-6xl p-6 md:p-8">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href="/institution/programs"
          className="focus-ring font-body mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-rose-500"
        >
          <ArrowLeftIcon />
          Back to Programs
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="card-surface animate-rise shadow-card">
          <div className="p-6 md:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0">

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <CategoryBadge
                    category={program.category}
                  />

                  <PublishBadge
                    published={program.isPublished}
                  />

                  <ArchiveBadge
                    archived={program.isArchived}
                  />
                </div>

                <h1 className="font-display break-words text-3xl font-semibold tracking-tight text-wine-700 md:text-4xl">
                  {program.title}
                </h1>

                {program.shortDescription && (
                  <p className="font-body mt-3 max-w-3xl text-base leading-7 text-ink-soft">
                    {program.shortDescription}
                  </p>
                )}

                <div className="font-body mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">

                  {program.region && (
                    <span>
                      📍 {program.region}
                    </span>
                  )}

                  {program.targetAudience && (
                    <span>
                      👥 {program.targetAudience}
                    </span>
                  )}

                  {program.fundingType && (
                    <span>
                      💰 {program.fundingType}
                    </span>
                  )}

                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex shrink-0 flex-wrap gap-3">

                <Link
                  href={`/institution/programs/${program.id}/edit`}
                  className="focus-ring font-body inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
                >
                  <EditIcon />
                  Edit
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="focus-ring font-body inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <TrashIcon />

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mt-6 grid gap-5 md:grid-cols-3">

          {/* Amount */}

          <div className="card-surface p-6 shadow-card">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rise-gradient-soft text-rose-500">
                <MoneyIcon />
              </div>

              <p className="font-body text-sm font-medium text-ink-soft">
                Funding Amount
              </p>
            </div>

            <p className="font-display mt-4 text-lg font-semibold text-wine-700">
              {formatAmountRange(
                program.amountMin,
                program.amountMax,
                program.currency
              )}
            </p>

          </div>

          {/* Opening */}

          <div className="card-surface p-6 shadow-card">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CalendarIcon />
              </div>

              <p className="font-body text-sm font-medium text-ink-soft">
                Opening Date
              </p>
            </div>

            <p className="font-display mt-4 text-lg font-semibold text-wine-700">
              {formatDate(program.openingDate)}
            </p>

          </div>

          {/* Closing */}

          <div className="card-surface p-6 shadow-card">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/20 text-gold-500">
                <CalendarIcon />
              </div>

              <p className="font-body text-sm font-medium text-ink-soft">
                Closing Date
              </p>
            </div>

            <p className="font-display mt-4 text-lg font-semibold text-wine-700">
              {formatDate(program.closingDate)}
            </p>

          </div>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <section className="card-surface mt-6 p-6 shadow-card md:p-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rise-gradient-soft text-rose-500">
              <FileIcon />
            </div>

            <h2 className="font-display text-xl font-semibold text-wine-700">
              Description
            </h2>
          </div>

          <div className="mt-5">
            <p className="font-body whitespace-pre-wrap text-sm leading-7 text-ink-soft">
              {program.description || "No description provided."}
            </p>
          </div>

        </section>

        {/* =================================================
            ELIGIBILITY + DOCUMENTS
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Eligibility */}

          <section className="card-surface p-6 shadow-card">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckIcon />
              </div>

              <h2 className="font-display text-lg font-semibold text-wine-700">
                Eligibility
              </h2>
            </div>

            {program.eligibility?.length ? (
              <ul className="mt-5 space-y-3">

                {program.eligibility.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="font-body flex gap-3 text-sm leading-6 text-ink-soft"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <CheckIcon />
                      </span>

                      <span>{item}</span>
                    </li>
                  )
                )}

              </ul>
            ) : (
              <p className="font-body mt-5 text-sm text-ink-soft/70">
                No eligibility requirements specified.
              </p>
            )}

          </section>

          {/* Required Documents */}

          <section className="card-surface p-6 shadow-card">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-500">
                <FileIcon />
              </div>

              <h2 className="font-display text-lg font-semibold text-wine-700">
                Required Documents
              </h2>
            </div>

            {program.requiredDocuments?.length ? (
              <ul className="mt-5 space-y-3">

                {program.requiredDocuments.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="font-body flex gap-3 text-sm leading-6 text-ink-soft"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wine-100 text-wine-500">
                        <CheckIcon />
                      </span>

                      <span>{item}</span>
                    </li>
                  )
                )}

              </ul>
            ) : (
              <p className="font-body mt-5 text-sm text-ink-soft/70">
                No required documents specified.
              </p>
            )}

          </section>

        </div>

        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

        {(program.website ||
          program.email ||
          program.phone) && (
          <section className="card-surface mt-6 p-6 shadow-card">

            <h2 className="font-display text-lg font-semibold text-wine-700">
              Contact Information
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">

              {program.website && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                    Website
                  </p>

                  <a
                    href={program.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring font-body mt-1 block break-all text-sm font-medium text-rose-500 hover:underline"
                  >
                    {program.website}
                  </a>
                </div>
              )}

              {program.email && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                    Email
                  </p>

                  <a
                    href={`mailto:${program.email}`}
                    className="focus-ring font-body mt-1 block break-all text-sm font-medium text-rose-500 hover:underline"
                  >
                    {program.email}
                  </a>
                </div>
              )}

              {program.phone && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                    Phone
                  </p>

                  <a
                    href={`tel:${program.phone}`}
                    className="focus-ring font-body mt-1 block text-sm font-medium text-rose-500 hover:underline"
                  >
                    {program.phone}
                  </a>
                </div>
              )}

            </div>
          </section>
        )}

        {/* =================================================
            APPLICATIONS
        ================================================= */}

        <section className="card-surface mt-6 shadow-card">

          <div className="border-b border-sand-200 p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rise-gradient-soft text-rose-500">
                  <UsersIcon />
                </div>

                <div>
                  <h2 className="font-display text-lg font-semibold text-wine-700">
                    Applications
                  </h2>

                  <p className="font-body text-sm text-ink-soft">
                    {applicationsLoading
                      ? "Loading applications..."
                      : `${applications.length} application${
                          applications.length !== 1
                            ? "s"
                            : ""
                        }`}
                  </p>
                </div>

              </div>

              {program._count?.applications !==
                undefined && (
                <span className="font-body rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-soft">
                  {program._count.applications} total
                </span>
              )}

            </div>

          </div>

          <div className="p-6">

            {applicationsLoading ? (
              <div className="space-y-3">
                <div className="h-14 animate-pulse rounded-xl bg-sand-100" />
                <div className="h-14 animate-pulse rounded-xl bg-sand-100" />
              </div>
            ) : applicationsError ? (
              <div className="font-body rounded-xl border border-gold-400/30 bg-gold-400/10 p-5 text-sm text-gold-500">
                {applicationsError}
              </div>
            ) : applications.length === 0 ? (
              <div className="py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
                  <UsersIcon />
                </div>

                <p className="font-body mt-4 font-medium text-ink">
                  No applications yet
                </p>

                <p className="font-body mt-1 text-sm text-ink-soft/70">
                  Applications submitted to this program will appear here.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[650px] text-left">

                  <thead>
                    <tr className="border-b border-sand-200">

                      <th className="font-body px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                        Applicant
                      </th>

                      <th className="font-body px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                        Amount
                      </th>

                      <th className="font-body px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                        Status
                      </th>

                      <th className="font-body px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                        Date
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {applications.map(
                      (application) => (
                        <tr
                          key={application.id}
                          className="border-b border-sand-100 transition hover:bg-sand-50"
                        >

                          <td className="px-4 py-4">

                            <div>
                              <p className="font-body font-medium text-ink">
                                {application.applicant
                                  ?.name ||
                                  application.applicantId}
                              </p>

                              {application
                                .applicant
                                ?.email && (
                                <p className="font-body mt-1 text-xs text-ink-soft/70">
                                  {
                                    application
                                      .applicant
                                      .email
                                  }
                                </p>
                              )}
                            </div>

                          </td>

                          <td className="font-body px-4 py-4 text-sm text-ink-soft">
                            {application.amountRequested !==
                            undefined
                              ? formatAmount(
                                  application.amountRequested
                                )
                              : "-"}
                          </td>

                          <td className="px-4 py-4">
                            <ApplicationStatusBadge
                              status={
                                application.status
                              }
                            />
                          </td>

                          <td className="font-body px-4 py-4 text-sm text-ink-soft">
                            {formatDate(
                              application.createdAt
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </section>

        {/* =================================================
            METADATA
        ================================================= */}

        <div className="font-body mt-6 pb-10 text-center text-xs text-ink-soft/70">

          <p>
            Created{" "}
            {formatDate(program.createdAt)}
          </p>

          <p className="mt-1">
            Last updated{" "}
            {formatDate(program.updatedAt)}
          </p>

        </div>

      </div>
    </div>
  );
}