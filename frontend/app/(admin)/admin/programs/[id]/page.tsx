"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  Calendar,
  Wallet,
  MapPin,
  Users,
  FileText,
  CheckCircle2,
  Trash2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface Institution {
  id?: string;
  institutionName?: string;
  city?: string;
  type?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

interface Program {
  id: string;
  slug: string;
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
  targetAudience?: string;

  eligibility?: string[];
  requiredDocuments?: string[];

  website?: string;
  email?: string;
  phone?: string;

  isPublished: boolean;
  isArchived: boolean;

  institutionProfile?: Institution;

  _count?: {
    applications?: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

function formatAmount(
  amount?: string | number,
  currency?: string
): string {
  if (amount === undefined || amount === null) return "-";

  const numeric = Number(amount);

  if (Number.isNaN(numeric)) {
    return `${amount} ${currency || "DZD"}`;
  }

  return `${numeric.toLocaleString("fr-FR")} ${currency || "DZD"}`;
}

function formatDate(date?: string): string {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ program }: { program: Program }) {
  if (program.isArchived) {
    return (
      <span className="font-body inline-flex items-center rounded-full bg-sand-200 px-3 py-1 text-xs font-semibold text-ink-soft">
        Archivé
      </span>
    );
  }

  if (program.isPublished) {
    return (
      <span className="font-body inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Publié
      </span>
    );
  }

  return (
    <span className="font-body inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
      Brouillon
    </span>
  );
}

export default function AdminProgramDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadProgram = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/programs?page=1&pageSize=100&sort=newest`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Session expirée. Veuillez vous reconnecter."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Accès refusé. Vous devez être administrateur."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Erreur lors du chargement du programme."
        );
      }

      const items: Program[] = result.items || [];

      const found = items.find(
        (item) =>
          String(item.id) === String(id) ||
          String(item.slug) === String(id)
      );

      if (!found) {
        throw new Error(
          "Programme introuvable ou vous n'y avez pas accès."
        );
      }

      setProgram(found);
    } catch (err) {
      console.error("ADMIN PROGRAM DETAIL ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  async function handleDelete() {
    if (!program) return;

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${program.title}" ?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_URL}/admin/programs/${program.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Session expirée. Veuillez vous reconnecter."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Accès refusé. Vous devez être administrateur."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Impossible de supprimer le programme."
        );
      }

      router.push("/admin/programs");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 h-5 w-40 animate-pulse rounded bg-sand-200" />

          <div className="card-surface p-8 shadow-card">
            <div className="h-8 w-2/3 animate-pulse rounded bg-sand-200" />

            <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-sand-200" />

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="h-24 animate-pulse rounded-xl bg-sand-100" />
              <div className="h-24 animate-pulse rounded-xl bg-sand-100" />
              <div className="h-24 animate-pulse rounded-xl bg-sand-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-sand-50 p-6 md:p-8">
        <div className="mx-auto max-w-xl">
          <Link
            href="/admin/programs"
            className="focus-ring font-body mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-rose-500"
          >
            <ArrowLeft size={16} />
            Retour aux programmes
          </Link>

          <div className="card-surface animate-rise p-8 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <span className="text-2xl">!</span>
            </div>

            <h1 className="font-display mt-5 text-xl font-semibold text-wine-700">
              Impossible de charger le programme
            </h1>

            <p className="font-body mt-3 text-sm leading-6 text-ink-soft">
              {error || "Programme introuvable."}
            </p>

            <button
              onClick={loadProgram}
              className="focus-ring font-body mt-7 rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-5xl p-6 md:p-8">

        {/* Back */}
        <Link
          href="/admin/programs"
          className="focus-ring font-body mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-rose-500"
        >
          <ArrowLeft size={16} />
          Retour aux programmes
        </Link>

        {/* Header */}
        <div className="card-surface animate-rise shadow-card">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">

                  <span className="font-body flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500">
                    <ShieldCheck size={12} />
                    Vue admin
                  </span>

                  {program.category && (
                    <span className="font-body rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-500">
                      {program.category}
                    </span>
                  )}

                  <StatusBadge program={program} />
                </div>

                <h1 className="font-display break-words text-3xl font-semibold tracking-tight text-wine-700 md:text-4xl">
                  {program.title}
                </h1>

                {program.shortDescription && (
                  <p className="font-body mt-3 max-w-3xl text-base leading-7 text-ink-soft">
                    {program.shortDescription}
                  </p>
                )}

                <div className="font-body mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">

                  <span className="flex items-center gap-1.5">
                    <Landmark
                      size={14}
                      className="text-rose-500"
                    />
                    {program.institutionProfile?.institutionName ||
                      "—"}
                  </span>

                  {program.institutionProfile?.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin
                        size={14}
                        className="text-gold-500"
                      />
                      {program.institutionProfile.city}
                    </span>
                  )}

                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap gap-3">

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="focus-ring font-body inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  {deleting
                    ? "Suppression..."
                    : "Supprimer"}
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <div className="card-surface p-6 shadow-card">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rise-gradient-soft text-rose-500">
                <Wallet size={20} />
              </div>

              <p className="font-body text-sm font-medium text-ink-soft">
                Montant
              </p>
            </div>

            <p className="font-display mt-4 text-lg font-semibold text-wine-700">
              {formatAmount(
                program.amountMin,
                program.currency
              )}{" "}
              –{" "}
              {formatAmount(
                program.amountMax,
                program.currency
              )}
            </p>
          </div>

          <div className="card-surface p-6 shadow-card">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Calendar size={20} />
              </div>

              <p className="font-body text-sm font-medium text-ink-soft">
                Date d&apos;ouverture
              </p>
            </div>

            <p className="font-display mt-4 text-lg font-semibold text-wine-700">
              {formatDate(program.openingDate)}
            </p>
          </div>

          <div className="card-surface p-6 shadow-card">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/20 text-gold-500">
                <Calendar size={20} />
              </div>

              <p className="font-body text-sm font-medium text-ink-soft">
                Date limite
              </p>
            </div>

            <p className="font-display mt-4 text-lg font-semibold text-wine-700">
              {formatDate(program.closingDate)}
            </p>
          </div>

        </div>

        {/* Description */}
        <section className="card-surface mt-6 p-6 shadow-card md:p-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rise-gradient-soft text-rose-500">
              <FileText size={20} />
            </div>

            <h2 className="font-display text-xl font-semibold text-wine-700">
              Description
            </h2>

          </div>

          <p className="font-body mt-5 whitespace-pre-wrap text-sm leading-7 text-ink-soft">
            {program.description ||
              "Aucune description fournie."}
          </p>

        </section>

        {/* Eligibility + Documents */}
        {(program.eligibility?.length ||
          program.requiredDocuments?.length) && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            {program.eligibility &&
              program.eligibility.length > 0 && (
                <section className="card-surface p-6 shadow-card">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <CheckCircle2 size={20} />
                    </div>

                    <h2 className="font-display text-lg font-semibold text-wine-700">
                      Éligibilité
                    </h2>

                  </div>

                  <ul className="mt-5 space-y-3">

                    {program.eligibility.map(
                      (item, i) => (
                        <li
                          key={`${item}-${i}`}
                          className="font-body flex gap-3 text-sm leading-6 text-ink-soft"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <CheckCircle2 size={12} />
                          </span>

                          <span>{item}</span>
                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}

            {program.requiredDocuments &&
              program.requiredDocuments.length > 0 && (
                <section className="card-surface p-6 shadow-card">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-100 text-wine-500">
                      <FileText size={20} />
                    </div>

                    <h2 className="font-display text-lg font-semibold text-wine-700">
                      Documents requis
                    </h2>

                  </div>

                  <ul className="mt-5 space-y-3">

                    {program.requiredDocuments.map(
                      (item, i) => (
                        <li
                          key={`${item}-${i}`}
                          className="font-body flex gap-3 text-sm leading-6 text-ink-soft"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wine-100 text-wine-500">
                            <CheckCircle2 size={12} />
                          </span>

                          <span>{item}</span>
                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}

          </div>
        )}

        {/* Applications count */}
        {program._count?.applications !== undefined && (
          <section className="card-surface mt-6 flex items-center gap-4 p-6 shadow-card">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rise-gradient-soft text-rose-500">
              <Users size={20} />
            </div>

            <div>

              <p className="font-display text-lg font-semibold text-wine-700">
                {program._count.applications} candidature
                {program._count.applications !== 1
                  ? "s"
                  : ""}
              </p>

              <p className="font-body text-sm text-ink-soft">
                reçue
                {program._count.applications !== 1
                  ? "s"
                  : ""}{" "}
                pour ce programme
              </p>

            </div>

          </section>
        )}

        {/* Metadata */}
        <div className="font-body mt-6 pb-10 text-center text-xs text-ink-soft/70">

          <p>
            Créé le {formatDate(program.createdAt)}
          </p>

          <p className="mt-1">
            Dernière mise à jour le{" "}
            {formatDate(program.updatedAt)}
          </p>

        </div>

      </div>
    </div>
  );
}