"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  ExternalLink,
  Mail,
} from "lucide-react";

import { Header } from "@/components/layout/Header";

import { API_BASE_URL as API_URL } from "@/services/api";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
type UrlType = "expert" | "institution";
type ApplicationType = "EXPERT" | "INSTITUTION";

interface Application {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;

  email: string;

  fullName?: string;
  motivation?: string;

  // Expert
  title?: string;
  experience?: string;
  specialties?: string;
  languages?: string;
  linkedin?: string;
  portfolio?: string;
  certifications?: string;
  cvPath?: string | null;

  // Institution
  organizationName?: string;
  organizationType?: string;
  wilaya?: string;
  contactName?: string;
  contactRole?: string;
  phone?: string;
  website?: string;
  sectors?: string;
  documentPath?: string | null;

  createdAt?: string;
}

interface ApplicationResponse {
  application?: Application;
  message?: string;
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
};

function endpointFor(type: UrlType): string {
  return type === "expert"
    ? "expert-applications"
    : "institution-applications";
}

function isValidType(type: string | undefined): type is UrlType {
  return type === "expert" || type === "institution";
}

function getDisplayName(application: Application): string {
  return (
    application.fullName ||
    application.organizationName ||
    application.contactName ||
    application.email ||
    "—"
  );
}

function getFileUrl(path?: string | null): string | null {
  if (!path) return null;

  // Already an absolute URL.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Remove a leading slash so we don't create //.
  const cleanPath = path.replace(/^\/+/, "");

  const backendUrl = API_URL.replace(/\/api\/?$/, "");

  return `${backendUrl}/${cleanPath}`;
}

function formatDate(date?: string): string {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const rawType = params?.type;

  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : undefined;

  const typeValue =
    typeof rawType === "string"
      ? rawType.toLowerCase()
      : Array.isArray(rawType)
        ? rawType[0]?.toLowerCase()
        : undefined;

  const type: UrlType | undefined = isValidType(typeValue)
    ? typeValue
    : undefined;

  const [application, setApplication] = useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!id || !type) {
      setLoading(false);
      setApplication(null);
      setError("Demande invalide.");
      return;
    }

    let cancelled = false;

    async function fetchRequest() {
      try {
        setLoading(true);
        setError("");
        setActionError("");

       if (!type) {
          setActionError("Type de demande invalide.");
          return;
        }

        const endpoint = endpointFor(type);


        const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const json: ApplicationResponse = await response
          .json()
          .catch(() => ({}));

        if (cancelled) return;

        if (response.status === 401) {
          setError("Votre session a expiré. Veuillez vous reconnecter.");
          setApplication(null);
          return;
        }

        if (response.status === 403) {
          setError("Vous n'avez pas l'autorisation d'accéder à cette demande.");
          setApplication(null);
          return;
        }

        if (response.status === 404) {
          setError("Cette demande est introuvable.");
          setApplication(null);
          return;
        }

        if (!response.ok) {
          throw new Error(
            json?.message || "Impossible de charger la demande."
          );
        }

        if (!json.application) {
          throw new Error("Les données de la demande sont introuvables.");
        }

        setApplication({
          ...json.application,
          type: type === "expert" ? "EXPERT" : "INSTITUTION",
        });
      } catch (err) {
        if (cancelled) return;

        console.error("FETCH REQUEST ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger la demande."
        );

        setApplication(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRequest();

    return () => {
      cancelled = true;
    };
  }, [id, type]);

  async function handleDecision(decision: "approve" | "reject") {
    if (!id || !type || !application) {
      return;
    }

    if (application.status !== "PENDING") {
      return;
    }

    const isApproving = decision === "approve";

    const confirmed = window.confirm(
      isApproving
        ? "Voulez-vous vraiment accepter cette candidature ?"
        : "Voulez-vous vraiment refuser cette candidature ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setActionError("");

      const endpoint = endpointFor(type);

      /*
       * Authentication is handled automatically by the browser
       * through the httpOnly cookie.
       */
      const response = await fetch(
        `${API_URL}/${endpoint}/${id}/${decision}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const json = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Vous n'avez pas l'autorisation de modifier cette demande."
        );
      }

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Impossible de ${
              isApproving ? "valider" : "refuser"
            } la candidature.`
        );
      }

      /*
       * Update the local UI immediately.
       */
      setApplication((current) =>
        current
          ? {
              ...current,
              status: isApproving ? "APPROVED" : "REJECTED",
            }
          : current
      );

      /*
       * Small delay so the admin can see the updated status,
       * then return to the requests list.
       */
      setTimeout(() => {
        router.push("/admin/requests");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error("DECISION ERROR:", err);

      setActionError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function notify() {
    if (!application?.email) {
      setActionError("Aucune adresse email n'est disponible.");
      return;
    }

    const displayName = getDisplayName(application);

    const subject =
      application.type === "EXPERT"
        ? "Félicitations 🎉 Vous êtes désormais Experte Ellevadz"
        : "Félicitations 🎉 Votre institution rejoint Ellevadz";

    const body = `Bonjour ${displayName},

Nous avons le plaisir de vous annoncer que votre candidature a été acceptée.

Bienvenue dans la communauté Ellevadz.

L'équipe Ellevadz`;

    const gmailUrl =
      "https://mail.google.com/mail/?" +
      new URLSearchParams({
        view: "cm",
        fs: "1",
        to: application.email,
        su: subject,
        body,
      }).toString();

    window.open(
      gmailUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <>
        <Header title="Détails candidature" />

        <main className="p-6 lg:p-8">
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-rose-500" />

              <p className="text-sm text-ink-soft">
                Chargement de la candidature...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!application) {
    return (
      <>
        <Header title="Détails candidature" />

        <main className="p-6 lg:p-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <p className="font-medium text-rose-700">
              {error || "Demande introuvable."}
            </p>

            <Link
              href="/admin/requests"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft size={16} />
              Retour aux demandes
            </Link>
          </div>
        </main>
      </>
    );
  }

  const displayName = getDisplayName(application);

  const fileHref = getFileUrl(
    application.type === "EXPERT"
      ? application.cvPath
      : application.documentPath
  );

  const isPending = application.status === "PENDING";

  return (
    <>
      <Header title="Détails candidature" />

      <main className="space-y-6 p-6 lg:p-8">
        {/* Breadcrumb */}
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 transition hover:text-rose-700"
        >
          <ArrowLeft size={18} />
          Retour aux demandes
        </Link>

        {/* Errors */}
        {(error || actionError) && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p>{error || actionError}</p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setActionError("");
              }}
              className="shrink-0 rounded-lg p-1 transition hover:bg-rose-100"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header card */}
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rise-gradient text-sm font-bold text-white">
                  {displayName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((word) => word[0]?.toUpperCase())
                    .join("") || "?"}
                </div>

                <div>
                  <h1 className="font-display text-2xl font-bold text-wine-900">
                    {displayName}
                  </h1>

                  <p className="mt-1 text-sm text-ink-soft">
                    {application.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${
                    application.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : application.status === "REJECTED"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {STATUS_LABELS[application.status]}
                </span>

                <span className="inline-flex rounded-full bg-sand-100 px-4 py-2 text-xs font-semibold text-ink-soft">
                  {application.type === "EXPERT"
                    ? "Experte"
                    : "Institution"}
                </span>
              </div>
            </div>

            {application.createdAt && (
              <div className="text-sm text-ink-soft">
                <span className="font-medium text-ink">
                  Date de candidature
                </span>
                <br />
                {formatDate(application.createdAt)}
              </div>
            )}
          </div>
        </section>

        {/* Professional information */}
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
          <h2 className="mb-5 font-display text-xl font-semibold text-ink">
            Informations professionnelles
          </h2>

          {application.type === "EXPERT" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem
                label="Titre professionnel"
                value={application.title}
              />

              <InfoItem
                label="Expérience"
                value={application.experience}
              />

              <InfoItem
                label="Domaines d'expertise"
                value={application.specialties}
              />

              <InfoItem
                label="Langues"
                value={application.languages}
              />

              <InfoItem
                label="Certifications"
                value={application.certifications}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem
                label="Institution"
                value={application.organizationName}
              />

              <InfoItem
                label="Type d'institution"
                value={application.organizationType}
              />

              <InfoItem
                label="Wilaya"
                value={application.wilaya}
              />

              <InfoItem
                label="Secteurs"
                value={application.sectors}
              />

              <InfoItem
                label="Nom du contact"
                value={application.contactName}
              />

              <InfoItem
                label="Fonction du contact"
                value={application.contactRole}
              />

              <InfoItem
                label="Téléphone"
                value={application.phone}
              />
            </div>
          )}
        </section>

        {/* Online presence */}
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
          <h2 className="mb-5 font-display text-xl font-semibold text-ink">
            Présence professionnelle
          </h2>

          <div className="flex flex-wrap gap-3">
            {application.linkedin && (
              <ExternalLinkButton
                href={application.linkedin}
                label="LinkedIn"
              />
            )}

            {application.portfolio && (
              <ExternalLinkButton
                href={application.portfolio}
                label="Portfolio"
              />
            )}

            {application.website && (
              <ExternalLinkButton
                href={application.website}
                label="Site web"
              />
            )}

            {!application.linkedin &&
              !application.portfolio &&
              !application.website && (
                <p className="text-sm text-ink-soft">
                  Aucun lien professionnel renseigné.
                </p>
              )}
          </div>
        </section>

        {/* Motivation */}
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">
            Motivation
          </h2>

          <p className="whitespace-pre-wrap text-sm leading-7 text-ink-soft">
            {application.motivation || "Aucune motivation renseignée."}
          </p>
        </section>

        {/* File */}
        {fileHref && (
          <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Document
            </h2>

            <a
              href={fileHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
            >
              <FileText size={20} />

              {application.type === "EXPERT"
                ? "Voir le CV"
                : "Voir le document"}

              <ExternalLink size={15} />
            </a>
          </section>
        )}

        {/* Decision */}
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
          <h2 className="mb-5 font-display text-xl font-semibold text-ink">
            Décision
          </h2>

          {!isPending && (
            <div className="mb-5 rounded-xl bg-sand-50 p-4 text-sm text-ink-soft">
              Cette candidature a déjà été{" "}
              <strong>
                {application.status === "APPROVED"
                  ? "validée"
                  : "refusée"}
              </strong>
              .
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={actionLoading || !isPending}
              onClick={() => handleDecision("approve")}
              className="inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-3 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Check size={18} />
              )}

              Accepter
            </button>

            <button
              type="button"
              disabled={actionLoading || !isPending}
              onClick={() => handleDecision("reject")}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} />
              Refuser
            </button>

            <button
              type="button"
              onClick={notify}
              disabled={!application.email}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail size={18} />
              Notifier
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl bg-sand-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-ink">
        {value || "—"}
      </p>
    </div>
  );
}

function ExternalLinkButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
    >
      <ExternalLink size={16} />
      {label}
    </a>
  );
}