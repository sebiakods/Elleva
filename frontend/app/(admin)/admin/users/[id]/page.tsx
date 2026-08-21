
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Ban,
  CheckCircle,
  Star,
  Users as UsersIcon,
  BadgeCheck,
  Building2,
  Globe,
  Phone,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/+$/, "");

interface ExpertProfile {
  title?: string;
  specialties?: string[];
  sessionRateDA?: number;
  availableForBooking?: boolean;
  linkedinUrl?: string;
  websiteUrl?: string;
  rating?: number;
  reviewCount?: number;
  sessionCount?: number;
  isApprovedByAdmin?: boolean;
}

interface InstitutionProfile {
  institutionName?: string;
  type?: string;
  city?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  isVerified?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  expertProfile?: ExpertProfile | null;
  institutionProfile?: InstitutionProfile | null;
}

const roleMap: Record<string, string> = {
  ENTREPRENEUR: "Entrepreneure",
  EXPERT: "Experte",
  INSTITUTION: "Institution",
  ADMIN: "Administrateur",
};

/**
 * Converts an asset URL into a usable browser URL.
 *
 * Supports:
 * - Absolute URLs: https://...
 * - Absolute URLs: http://...
 * - Data URLs
 * - Blob URLs
 * - Relative URLs: /uploads/avatar.jpg
 * - Relative URLs: uploads/avatar.jpg
 */
function getAssetUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  // Already an absolute URL.
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Data or blob URL.
  if (/^(data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // Remove /api from the API URL to get backend origin.
  const apiOrigin = API_URL.replace(/\/api\/?$/, "");

  if (trimmed.startsWith("/")) {
    return `${apiOrigin}${trimmed}`;
  }

  return `${apiOrigin}/${trimmed}`;
}

function formatDate(date?: string): string {
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

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();

    return (
      data?.message ||
      data?.error ||
      data?.data?.message ||
      data?.data?.error ||
      `Erreur ${response.status}`
    );
  } catch {
    return `Erreur ${response.status}`;
  }
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();

  /**
   * IMPORTANT:
   *
   * Next.js useParams() can return:
   * string | string[] | undefined
   *
   * We normalize it immediately to a guaranteed string.
   */
  const rawId = params?.id;

  const userId: string =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0] ?? ""
        : "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user
   */
  useEffect(() => {
    if (!userId) {
      setError("Identifiant utilisateur manquant.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUser(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/users/${encodeURIComponent(userId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data = await response.json();

        const profile: User | null =
          data?.data?.user ??
          data?.data ??
          data?.user ??
          data ??
          null;

        if (!profile?.id) {
          throw new Error("Utilisateur introuvable.");
        }

        if (!cancelled) {
          setUser(profile);
        }
      } catch (err) {
        console.error("LOAD USER ERROR:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger cet utilisateur."
          );

          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /**
   * Suspend / activate user
   */
  async function toggleActive(): Promise<void> {
    if (!user || !userId || actionLoading) {
      return;
    }

    const action = user.isActive ? "suspend" : "activate";

    const confirmed = window.confirm(
      user.isActive
        ? `Voulez-vous vraiment suspendre ${user.name} ?`
        : `Voulez-vous vraiment réactiver ${user.name} ?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/users/${encodeURIComponent(userId)}/${action}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json().catch(() => null);

      const updatedUser =
        data?.data?.user ??
        data?.data ??
        data?.user ??
        null;

      const nextIsActive =
        typeof updatedUser?.isActive === "boolean"
          ? updatedUser.isActive
          : !user.isActive;

      setUser((prev) =>
        prev
          ? {
              ...prev,
              isActive: nextIsActive,
            }
          : prev
      );
    } catch (err) {
      console.error("TOGGLE USER STATUS ERROR:", err);

      window.alert(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut de cet utilisateur."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-sand-200
              border-t-rose-500
            "
          />

          <p className="text-sm text-ink-soft">
            Chargement de l'utilisateur...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-sm font-medium text-rose-700">
            {error || "Utilisateur introuvable"}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-sand-200
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-ink
              transition
              hover:bg-sand-50
            "
          >
            <ArrowLeft size={15} />
            Retour
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DERIVED VALUES
  // --------------------------------------------------

  const initials =
    user.name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const avatarUrl = getAssetUrl(user.avatarUrl);

  const institutionLogoUrl = getAssetUrl(
    user.institutionProfile?.logoUrl
  );

  const expert = user.expertProfile;
  const institution = user.institutionProfile;

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-5 sm:p-6 lg:p-8">

      {/* BACK */}

      <button
        type="button"
        onClick={() => router.back()}
        className="
          flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-ink-soft
          transition
          hover:text-rose-500
        "
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* HERO */}

      <div className="rounded-2xl bg-rise-gradient p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">

          {/* AVATAR */}

          <div
            className="
              flex
              h-20
              w-20
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              bg-white/15
              text-2xl
              font-bold
            "
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* USER INFO */}

          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold">
              {user.name}
            </h1>

            <p className="mt-1 text-sm text-white/85">
              {roleMap[user.role] ?? user.role}
            </p>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/70 sm:justify-start">
              <Calendar size={13} />
              Inscrit le {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ACCOUNT */}

      <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="flex flex-col gap-3 border-b border-sand-100 pb-4 sm:flex-row sm:items-center sm:justify-between">

          <h2 className="font-display text-xl text-ink">
            Compte
          </h2>

          <button
            type="button"
            onClick={toggleActive}
            disabled={actionLoading}
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-2
              text-sm
              font-semibold
              transition
              disabled:pointer-events-none
              disabled:opacity-60
              ${
                user.isActive
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }
            `}
          >
            {user.isActive ? (
              <Ban size={16} />
            ) : (
              <CheckCircle size={16} />
            )}

            {actionLoading
              ? "Modification..."
              : user.isActive
                ? "Suspendre"
                : "Réactiver"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          {/* EMAIL */}

          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Email
            </p>

            <p className="mt-1 flex items-center gap-2 break-all font-medium text-ink">
              <Mail size={14} className="shrink-0" />
              {user.email}
            </p>
          </div>

          {/* STATUS */}

          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Statut
            </p>

            <p
              className={`
                mt-1
                font-medium
                ${
                  user.isActive
                    ? "text-emerald-600"
                    : "text-amber-600"
                }
              `}
            >
              {user.isActive ? "Actif" : "Suspendu"}
            </p>
          </div>

          {/* VERIFICATION */}

          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Vérification
            </p>

            <p className="mt-1 flex items-center gap-2 font-medium text-ink">
              <BadgeCheck
                size={14}
                className={
                  user.isVerified
                    ? "text-emerald-600"
                    : "text-ink-soft"
                }
              />

              {user.isVerified
                ? "Compte vérifié"
                : "Non vérifié"}
            </p>
          </div>

          {/* ROLE */}

          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Rôle
            </p>

            <p className="mt-1 font-medium text-ink">
              {roleMap[user.role] ?? user.role}
            </p>
          </div>
        </div>

        {/* BIO */}

        {user.bio && (
          <div className="mt-5 border-t border-sand-100 pt-4">
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Bio
            </p>

            <p className="mt-1 text-sm leading-6 text-ink">
              {user.bio}
            </p>
          </div>
        )}
      </section>

      {/* EXPERT PROFILE */}

      {expert && (
        <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="mb-4 font-display text-xl text-ink">
            Profil expert
          </h2>

          {expert.title && (
            <p className="font-semibold text-ink">
              {expert.title}
            </p>
          )}

          {/* SPECIALTIES */}

          {expert.specialties &&
            expert.specialties.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {expert.specialties.map(
                  (specialty, index) => (
                    <span
                      key={`${specialty}-${index}`}
                      className="
                        rounded-full
                        bg-rose-100
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-rose-700
                      "
                    >
                      {specialty}
                    </span>
                  )
                )}
              </div>
            )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            {/* RATING */}

            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Star size={14} />

              <span>
                {(expert.rating ?? 0).toFixed(1)} / 5{" "}
                ({expert.reviewCount ?? 0} avis)
              </span>
            </div>

            {/* SESSIONS */}

            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <UsersIcon size={14} />

              <span>
                {expert.sessionCount ?? 0} sessions données
              </span>
            </div>

            {/* APPROVAL */}

            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <BadgeCheck size={14} />

              <span>
                {expert.isApprovedByAdmin
                  ? "Approuvée par l'admin"
                  : "En attente d'approbation"}
              </span>
            </div>

            {/* BOOKING */}

            <div className="text-sm text-ink-soft">
              {expert.sessionRateDA ?? 0} DA / session
              {" · "}
              {expert.availableForBooking
                ? "Disponible"
                : "Indisponible"}
            </div>
          </div>

          {/* LINKS */}

          {(expert.websiteUrl || expert.linkedinUrl) && (
            <div className="mt-5 border-t border-sand-100 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">

                {expert.websiteUrl && (
                  <a
                    href={expert.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      text-sm
                      font-medium
                      text-rose-600
                      hover:text-rose-700
                    "
                  >
                    Site web
                  </a>
                )}

                {expert.linkedinUrl && (
                  <a
                    href={expert.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      text-sm
                      font-medium
                      text-rose-600
                      hover:text-rose-700
                    "
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* INSTITUTION PROFILE */}

      {institution && (
        <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="mb-4 font-display text-xl text-ink">
            Profil institution
          </h2>

          <div className="flex items-center gap-3">

            {/* LOGO */}

            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-rose-100">
              {institutionLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={institutionLogoUrl}
                  alt={
                    institution.institutionName ||
                    "Institution"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2
                  size={20}
                  className="text-rose-600"
                />
              )}
            </div>

            {/* NAME */}

            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">
                {institution.institutionName ||
                  "Institution"}
              </p>

              <p className="text-xs text-ink-soft">
                {institution.type || "-"}
                {" · "}
                {institution.city || "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-ink-soft sm:grid-cols-2">

            {/* WEBSITE */}

            {institution.websiteUrl && (
              <a
                href={institution.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  items-center
                  gap-2
                  break-all
                  transition
                  hover:text-rose-600
                "
              >
                <Globe size={14} className="shrink-0" />
                {institution.websiteUrl}
              </a>
            )}

            {/* EMAIL */}

            {institution.contactEmail && (
              <a
                href={`mailto:${institution.contactEmail}`}
                className="
                  flex
                  items-center
                  gap-2
                  break-all
                  transition
                  hover:text-rose-600
                "
              >
                <Mail size={14} className="shrink-0" />
                {institution.contactEmail}
              </a>
            )}

            {/* PHONE */}

            {institution.contactPhone && (
              <a
                href={`tel:${institution.contactPhone}`}
                className="
                  flex
                  items-center
                  gap-2
                  transition
                  hover:text-rose-600
                "
              >
                <Phone size={14} className="shrink-0" />
                {institution.contactPhone}
              </a>
            )}

            {/* VERIFIED */}

            <div className="flex items-center gap-2">
              <BadgeCheck size={14} />

              {institution.isVerified
                ? "Vérifiée"
                : "Non vérifiée"}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
