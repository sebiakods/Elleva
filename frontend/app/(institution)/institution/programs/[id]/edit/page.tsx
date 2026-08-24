"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { API_BASE_URL as API } from "@/services/api";

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

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: Program[] | Program;
  items?: Program[];
  programs?: Program[];
}

/**
 * Parse API responses safely.
 */
async function parseApiResponse(response: Response): Promise<ApiResponse> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    throw new Error("Le serveur a retourné une réponse invalide.");
  }
}


function redirectToLogin(router: ReturnType<typeof useRouter>) {
  router.push("/login?redirect=/institution/programs");
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


  const loadProgram = useCallback(async () => {
    if (!id) {
      setLoadError("L'identifiant du programme est manquant.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      const response = await fetch(`${API}/institution/programs`, {
        method: "GET",

        /*
         * This is the replacement for Authorization: Bearer ...
         *
         * The browser automatically sends the HTTP-only
         * authentication cookie.
         */
        credentials: "include",

        headers: {
          Accept: "application/json",
        },

        cache: "no-store",
      });

      /*
       * Authentication failed / session expired.
       */
      if (response.status === 401) {
        redirectToLogin(router);
        return;
      }

      const json = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          json.message ||
            json.error ||
            `Impossible de charger les programmes (${response.status}).`
        );
      }

      /*
       * The backend may return:
       *
       * [
       *   ...
       * ]
       *
       * or:
       *
       * {
       *   data: [...]
       * }
       *
       * or:
       *
       * {
       *   items: [...]
       * }
       */
      const programs: Program[] = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.items)
          ? json.items
          : Array.isArray(json.programs)
            ? json.programs
            : Array.isArray(json)
              ? (json as unknown as Program[])
              : [];

      const program = programs.find(
        (item) => String(item.id) === String(id)
      );

      if (!program) {
        throw new Error(
          "Programme introuvable ou vous n'avez pas accès à ce programme."
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

      setIsPublished(Boolean(program.isPublished));
    } catch (err) {
      console.error("LOAD PROGRAM ERROR:", err);

      setLoadError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le programme."
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    /*
     * Validate title.
     */
    if (!cleanTitle) {
      setError("Veuillez saisir le titre du programme.");
      return;
    }

    /*
     * Convert amounts safely.
     */
    const min =
      amountMin.trim() === ""
        ? null
        : Number(amountMin);

    const max =
      amountMax.trim() === ""
        ? null
        : Number(amountMax);

    if (min !== null && Number.isNaN(min)) {
      setError("Le montant minimum doit être un nombre valide.");
      return;
    }

    if (max !== null && Number.isNaN(max)) {
      setError("Le montant maximum doit être un nombre valide.");
      return;
    }

    if (min !== null && min < 0) {
      setError("Le montant minimum ne peut pas être négatif.");
      return;
    }

    if (max !== null && max < 0) {
      setError("Le montant maximum ne peut pas être négatif.");
      return;
    }

    if (min !== null && max !== null && min > max) {
      setError(
        "Le montant minimum ne peut pas être supérieur au montant maximum."
      );
      return;
    }

    if (!id) {
      setError("L'identifiant du programme est manquant.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Generate a safe slug.
       */
      const generatedSlug = cleanTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const slug =
        generatedSlug || `program-${id}`;

      const response = await fetch(
        `${API}/institution/programs/${encodeURIComponent(id)}`,
        {
          method: "PUT",

          /*
           * IMPORTANT:
           * Authentication cookie is automatically sent.
           *
           * There is NO:
           * Authorization: Bearer token
           */
          credentials: "include",

          headers: {
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

      /*
       * Session expired / user is not authenticated.
       */
      if (response.status === 401) {
        redirectToLogin(router);
        return;
      }

      const data = await parseApiResponse(response);

      console.log("UPDATE PROGRAM:", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            `La modification a échoué (${response.status}).`
        );
        return;
      }

      /*
       * Update succeeded.
       */
      router.push(`/institution/programs/${id}`);
      router.refresh();
    } catch (err) {
      console.error("UPDATE PROGRAM ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de contacter le serveur."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Loading                                                          */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />

          <p className="font-body text-sm text-ink-soft">
            Chargement du programme…
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Loading error                                                    */
  /* ---------------------------------------------------------------- */

  if (loadError) {
    return (
      <div className="min-h-screen bg-sand-50 p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/institution/programs"
            className="font-body inline-flex items-center text-sm font-medium text-ink-soft hover:text-rose-500"
          >
            ← Retour aux programmes
          </Link>

          <div className="font-body mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-wine-700">
            {loadError}
          </div>

          <button
            type="button"
            onClick={loadProgram}
            className="font-body mt-4 rounded-xl bg-rise-gradient px-5 py-3 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Page                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-sand-50 p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/institution/programs/${id}`}
          className="font-body inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-rose-500"
        >
          ← Retour au programme
        </Link>

        <div className="mb-8 mt-4">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            Tableau de bord institution
          </p>

          <h1 className="font-display mt-1 text-3xl font-semibold text-wine-700 md:text-4xl">
            Modifier le programme de financement
          </h1>

          <p className="font-body mt-2 text-ink-soft">
            Modifiez les informations du programme ci-dessous.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-surface animate-rise space-y-6 p-6 shadow-card md:p-8"
        >
          {error && (
            <div
              role="alert"
              className="font-body rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-wine-700"
            >
              {error}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* Title                                                    */}
          {/* -------------------------------------------------------- */}

          <div>
            <label
              htmlFor="title"
              className="font-body mb-1.5 block text-sm font-semibold text-ink"
            >
              Titre du programme
            </label>

            <input
              id="title"
              type="text"
              required
              disabled={submitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink placeholder:text-ink-soft/60 transition focus:border-rose-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* -------------------------------------------------------- */}
          {/* Description                                               */}
          {/* -------------------------------------------------------- */}

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
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="focus-ring font-body w-full resize-none rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink transition focus:border-rose-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* -------------------------------------------------------- */}
          {/* Category                                                  */}
          {/* -------------------------------------------------------- */}

          <div>
            <label
              htmlFor="category"
              className="font-body mb-1.5 block text-sm font-semibold text-ink"
            >
              Catégorie
            </label>

            <select
              id="category"
              disabled={submitting}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 text-ink transition focus:border-rose-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {CATEGORIES.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Amount                                                    */}
          {/* -------------------------------------------------------- */}

          <div>
            <span className="font-body mb-1.5 block text-sm font-semibold text-ink">
              Montant du financement
            </span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <input
                  id="amountMin"
                  type="number"
                  min={0}
                  step="1"
                  disabled={submitting}
                  value={amountMin}
                  onChange={(e) =>
                    setAmountMin(e.target.value)
                  }
                  placeholder="Minimum"
                  className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 pr-14 text-ink disabled:cursor-not-allowed disabled:opacity-60"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs font-semibold text-ink-soft">
                  DZD
                </span>
              </div>

              <div className="relative">
                <input
                  id="amountMax"
                  type="number"
                  min={0}
                  step="1"
                  disabled={submitting}
                  value={amountMax}
                  onChange={(e) =>
                    setAmountMax(e.target.value)
                  }
                  placeholder="Maximum"
                  className="focus-ring font-body w-full rounded-xl border border-sand-200 bg-sand-50 p-3 pr-14 text-ink disabled:cursor-not-allowed disabled:opacity-60"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs font-semibold text-ink-soft">
                  DZD
                </span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Published                                                 */}
          {/* -------------------------------------------------------- */}

          <div className="flex items-center justify-between rounded-xl bg-sand-100 p-4">
            <div>
              <p className="font-body text-sm font-semibold text-ink">
                Publié
              </p>

              <p className="font-body mt-0.5 text-xs text-ink-soft">
                Le programme sera visible par les entrepreneures
                lorsqu&apos;il est publié.
              </p>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                setIsPublished((value) => !value)
              }
              aria-pressed={isPublished}
              aria-label={
                isPublished
                  ? "Dépublier le programme"
                  : "Publier le programme"
              }
              className={`relative h-7 w-12 rounded-full transition ${
                isPublished
                  ? "bg-rise-gradient"
                  : "bg-sand-200"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-card transition ${
                  isPublished
                    ? "left-[22px]"
                    : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Actions                                                   */}
          {/* -------------------------------------------------------- */}

          <div className="flex justify-end gap-3 border-t border-sand-200 pt-6">
            <Link
              href={`/institution/programs/${id}`}
              className="font-body rounded-xl px-5 py-3 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="font-body inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-6 py-3 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {submitting
                ? "Enregistrement…"
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}