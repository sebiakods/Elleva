"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { API_BASE_URL as API_URL } from "@/services/api";

interface FinancingProgram {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  category: string;
  sector?: string | null;
  fundingType?: string | null;
  amountMin: string | number;
  amountMax: string | number;
  currency: string;
  openingDate?: string | null;
  closingDate?: string | null;
  region?: string | null;
  targetAudience?: string | null;
  eligibility?: string[];
  requiredDocuments?: string[];
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
}

interface Application {
  id: string;
  applicantId: string;
  applicant?: {
    name?: string | null;
    email?: string | null;
  };
  status: string;
  amountRequested?: string | number | null;
  createdAt: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  success?: boolean;
}

interface ProgramsResponse {
  data?: FinancingProgram[];
  items?: FinancingProgram[];
  programs?: FinancingProgram[];
}

interface ApplicationsResponse {
  data?: Application[];
  applications?: Application[];
}


async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

/* ------------------------------------------------------------------ */
/* API response helpers                                               */
/* ------------------------------------------------------------------ */

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Le serveur a retourné une réponse invalide.");
  }
}

function getApiErrorMessage(
  data: ApiErrorResponse,
  fallback: string
): string {
  return data?.message || data?.error || fallback;
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return String(value);
  }

  return num.toLocaleString("fr-FR");
}

function formatDate(date?: string | null): string {
  if (!date) {
    return "-";
  }

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

function formatCategory(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function InstitutionProgramDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const id =
    Array.isArray(rawId)
      ? rawId[0] ?? ""
      : typeof rawId === "string"
        ? rawId
        : "";

  const [program, setProgram] =
    useState<FinancingProgram | null>(null);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [applicationsError, setApplicationsError] =
    useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  /* ---------------------------------------------------------------- */
  /* Load program                                                     */
  /* ---------------------------------------------------------------- */

  const loadProgram = useCallback(async () => {
    if (!id) {
      setError("Program ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      /*
       * Authentication is handled by the HttpOnly cookie.
       *
       * The browser sends the cookie automatically because
       * apiFetch() uses credentials: "include".
       */
      const response = await apiFetch("/institution/programs");

      if (!response.ok) {
        const data = await parseJsonResponse<ApiErrorResponse>(
          response
        );

        throw new Error(
          getApiErrorMessage(
            data,
            `Failed to load programs (${response.status})`
          )
        );
      }

      const json =
        await parseJsonResponse<
          FinancingProgram[] | ProgramsResponse
        >(response);

      let programs: FinancingProgram[] = [];

      if (Array.isArray(json)) {
        programs = json;
      } else if (Array.isArray(json.data)) {
        programs = json.data;
      } else if (Array.isArray(json.items)) {
        programs = json.items;
      } else if (Array.isArray(json.programs)) {
        programs = json.programs;
      }

      const found = programs.find(
        (item) => String(item.id) === String(id)
      );

      if (!found) {
        throw new Error(
          "Program not found or you do not have access to it."
        );
      }

      setProgram(found);
    } catch (err) {
      console.error("LOAD PROGRAM ERROR:", err);

      setProgram(null);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load program."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* ---------------------------------------------------------------- */
  /* Load applications                                                */
  /* ---------------------------------------------------------------- */

  const loadApplications = useCallback(async () => {
    if (!id) {
      setApplications([]);
      setApplicationsLoading(false);
      return;
    }

    try {
      setApplicationsLoading(true);
      setApplicationsError(null);

      /*
       * Authentication is handled by the HttpOnly cookie.
       * No token is manually retrieved or sent.
       */
      const response = await apiFetch(
        `/institution/programs/${encodeURIComponent(id)}/applications`
      );

      if (!response.ok) {
        const data =
          await parseJsonResponse<ApiErrorResponse>(response);

        throw new Error(
          getApiErrorMessage(
            data,
            `Applications could not be loaded (${response.status})`
          )
        );
      }

      const json =
        await parseJsonResponse<
          Application[] | ApplicationsResponse
        >(response);

      let data: Application[] = [];

      if (Array.isArray(json)) {
        data = json;
      } else if (Array.isArray(json.data)) {
        data = json.data;
      } else if (Array.isArray(json.applications)) {
        data = json.applications;
      }

      setApplications(data);
    } catch (err) {
      console.error("LOAD APPLICATIONS ERROR:", err);

      setApplications([]);

      setApplicationsError(
        err instanceof Error
          ? err.message
          : "Applications could not be loaded."
      );
    } finally {
      setApplicationsLoading(false);
    }
  }, [id]);

  /* ---------------------------------------------------------------- */
  /* Initial loading                                                  */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    void loadProgram();
    void loadApplications();
  }, [loadProgram, loadApplications]);

  /* ---------------------------------------------------------------- */
  /* Delete program                                                   */
  /* ---------------------------------------------------------------- */

  async function handleDelete() {
    if (!program || deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${program.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      /*
       * The HttpOnly authentication cookie is automatically
       * included by apiFetch().
       */
      const response = await apiFetch(
        `/institution/programs/${encodeURIComponent(program.id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data =
          await parseJsonResponse<ApiErrorResponse>(response);

        throw new Error(
          getApiErrorMessage(
            data,
            `Failed to delete program (${response.status})`
          )
        );
      }

      router.push("/institution/programs");
      router.refresh();
    } catch (err) {
      console.error("DELETE PROGRAM ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete program."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-5 w-32 animate-pulse rounded bg-sand-200" />

          <div className="card-surface mt-6 p-8 shadow-card">
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

  /* ---------------------------------------------------------------- */
  /* Error state                                                      */
  /* ---------------------------------------------------------------- */

  if (error || !program) {
    return (
      <div className="min-h-screen bg-sand-50 p-8">
        <div className="mx-auto max-w-xl">
          <div className="card-surface p-8 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <span className="text-2xl">!</span>
            </div>

            <h1 className="font-display mt-5 text-xl font-semibold text-wine-700">
              Unable to load program
            </h1>

            <p className="font-body mt-3 text-sm text-ink-soft">
              {error || "Program not found."}
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  void loadProgram();
                  void loadApplications();
                }}
                className="rounded-xl bg-rise-gradient px-5 py-2.5 font-body text-sm font-semibold text-white"
              >
                Try Again
              </button>

              <Link
                href="/institution/programs"
                className="rounded-xl border border-sand-200 bg-white px-5 py-2.5 font-body text-sm font-semibold text-ink-soft"
              >
                Back to Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Main page                                                        */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-6xl p-6 md:p-8">

        {/* Back */}
        <Link
          href="/institution/programs"
          className="font-body mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-rose-500"
        >
          ← Back to Programs
        </Link>

        {/* Header */}
        <div className="card-surface shadow-card">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div>
                <div className="mb-4 flex flex-wrap gap-2">
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

                  {program.isArchived && (
                    <span className="rounded-full bg-rose-100 px-3 py-1 font-body text-xs font-semibold text-wine-700">
                      Archived
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl font-semibold text-wine-700 md:text-4xl">
                  {program.title}
                </h1>

                {program.shortDescription && (
                  <p className="font-body mt-3 max-w-3xl text-base leading-7 text-ink-soft">
                    {program.shortDescription}
                  </p>
                )}

                <div className="font-body mt-5 flex flex-wrap gap-5 text-sm text-ink-soft">
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

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/institution/programs/${encodeURIComponent(
                    program.id
                  )}/edit`}
                  className="rounded-xl bg-rise-gradient px-5 py-2.5 font-body text-sm font-semibold text-white shadow-bloom hover:brightness-105"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 font-body text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                >
                  {deleting
                    ? "Deleting…"
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="card-surface p-6 shadow-card">
            <p className="font-body text-sm font-medium text-ink-soft">
              Funding Amount
            </p>

            <p className="font-display mt-3 text-lg font-semibold text-wine-700">
              {formatAmount(program.amountMin)} –{" "}
              {formatAmount(program.amountMax)}{" "}
              {program.currency}
            </p>
          </div>

          <div className="card-surface p-6 shadow-card">
            <p className="font-body text-sm font-medium text-ink-soft">
              Opening Date
            </p>

            <p className="font-display mt-3 text-lg font-semibold text-wine-700">
              {formatDate(program.openingDate)}
            </p>
          </div>

          <div className="card-surface p-6 shadow-card">
            <p className="font-body text-sm font-medium text-ink-soft">
              Closing Date
            </p>

            <p className="font-display mt-3 text-lg font-semibold text-wine-700">
              {formatDate(program.closingDate)}
            </p>
          </div>
        </div>

        {/* Description */}
        <section className="card-surface mt-6 p-6 shadow-card md:p-8">
          <h2 className="font-display text-xl font-semibold text-wine-700">
            Description
          </h2>

          <p className="font-body mt-5 whitespace-pre-wrap text-sm leading-7 text-ink-soft">
            {program.description || "No description provided."}
          </p>
        </section>

        {/* Eligibility + Documents */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card-surface p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-wine-700">
              Eligibility
            </h2>

            {program.eligibility?.length ? (
              <ul className="mt-5 space-y-3">
                {program.eligibility.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="font-body flex gap-3 text-sm text-ink-soft"
                  >
                    <span className="text-green-600">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body mt-5 text-sm text-ink-soft">
                No eligibility requirements specified.
              </p>
            )}
          </section>

          <section className="card-surface p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-wine-700">
              Required Documents
            </h2>

            {program.requiredDocuments?.length ? (
              <ul className="mt-5 space-y-3">
                {program.requiredDocuments.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="font-body flex gap-3 text-sm text-ink-soft"
                    >
                      <span className="text-wine-500">
                        ✓
                      </span>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="font-body mt-5 text-sm text-ink-soft">
                No required documents specified.
              </p>
            )}
          </section>
        </div>

        {/* Contact */}
        {(program.website ||
          program.email ||
          program.phone) && (
          <section className="card-surface mt-6 p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-wine-700">
              Contact Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {program.website && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase text-ink-soft">
                    Website
                  </p>

                  <a
                    href={program.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body mt-1 block break-all text-sm text-rose-500 hover:underline"
                  >
                    {program.website}
                  </a>
                </div>
              )}

              {program.email && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase text-ink-soft">
                    Email
                  </p>

                  <a
                    href={`mailto:${program.email}`}
                    className="font-body mt-1 block break-all text-sm text-rose-500 hover:underline"
                  >
                    {program.email}
                  </a>
                </div>
              )}

              {program.phone && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase text-ink-soft">
                    Phone
                  </p>

                  <a
                    href={`tel:${program.phone}`}
                    className="font-body mt-1 block text-sm text-rose-500 hover:underline"
                  >
                    {program.phone}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Applications */}
        <section className="card-surface mt-6 shadow-card">
          <div className="border-b border-sand-200 p-6">
            <h2 className="font-display text-lg font-semibold text-wine-700">
              Applications
            </h2>

            <p className="font-body mt-1 text-sm text-ink-soft">
              {applicationsLoading
                ? "Loading applications..."
                : `${applications.length} application${
                    applications.length !== 1
                      ? "s"
                      : ""
                  }`}
            </p>
          </div>

          <div className="p-6">
            {applicationsLoading ? (
              <div className="space-y-3">
                <div className="h-14 animate-pulse rounded-xl bg-sand-100" />
                <div className="h-14 animate-pulse rounded-xl bg-sand-100" />
              </div>
            ) : applicationsError ? (
              <div className="rounded-xl border border-gold-400/30 bg-gold-400/10 p-5 font-body text-sm text-gold-500">
                {applicationsError}
              </div>
            ) : applications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-body font-medium text-ink">
                  No applications yet
                </p>

                <p className="font-body mt-1 text-sm text-ink-soft">
                  Applications submitted to this
                  program will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-sand-200">
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase text-ink-soft">
                        Applicant
                      </th>

                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase text-ink-soft">
                        Amount
                      </th>

                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase text-ink-soft">
                        Status
                      </th>

                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase text-ink-soft">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((application) => (
                      <tr
                        key={application.id}
                        className="border-b border-sand-100"
                      >
                        <td className="px-4 py-4">
                          <p className="font-body font-medium text-ink">
                            {application.applicant?.name ||
                              application.applicantId}
                          </p>

                          {application.applicant?.email && (
                            <p className="font-body mt-1 text-xs text-ink-soft">
                              {application.applicant.email}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 font-body text-sm text-ink-soft">
                          {application.amountRequested !==
                            undefined &&
                          application.amountRequested !==
                            null
                            ? formatAmount(
                                application.amountRequested
                              )
                            : "-"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-sand-100 px-3 py-1 font-body text-xs font-semibold text-ink-soft">
                            {formatStatus(
                              application.status
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-body text-sm text-ink-soft">
                          {formatDate(
                            application.createdAt
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Metadata */}
        <div className="pb-10 pt-6 text-center font-body text-xs text-ink-soft">
          <p>
            Created {formatDate(program.createdAt)}
          </p>

          <p className="mt-1">
            Last updated {formatDate(program.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
