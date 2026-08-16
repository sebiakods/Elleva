"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Calendar, Ban, CheckCircle, Star, Users as UsersIcon,
  BadgeCheck, Building2, Globe, Phone,
} from "lucide-react";

import authService from "@/services/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

interface ExpertProfile {
  title: string;
  specialties: string[];
  sessionRateDA: number;
  availableForBooking: boolean;
  linkedinUrl?: string;
  websiteUrl?: string;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  isApprovedByAdmin: boolean;
}

interface InstitutionProfile {
  institutionName: string;
  type: string;
  city: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  isVerified: boolean;
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
  ADMIN: "Admin",
};

const ASSET_ORIGIN = API_URL.replace(/\/api$/, "");

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadUser() {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();

      const res = await fetch(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Utilisateur introuvable");

      const profile = data?.data?.user ?? data?.data ?? data;
      setUser(profile);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive() {
    if (!user) return;
    setActionLoading(true);
    try {
      const token = authService.getToken();
      const action = user.isActive ? "suspend" : "activate";

      const res = await fetch(`${API_URL}/users/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action impossible");

      setUser((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
    } catch (err) {
      console.error(err);
      alert("Impossible de modifier le statut de cet utilisateur.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-ink-soft">Chargement...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || "Utilisateur introuvable"}</p>
        <button onClick={() => router.back()} className="mt-4 rounded-lg border px-4 py-2 text-sm">
          ← Retour
        </button>
      </div>
    );
  }

  const initials = user.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-rose-500"
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      <div className="rounded-2xl bg-rise-gradient p-8 text-white shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-2xl font-bold">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${ASSET_ORIGIN}${user.avatarUrl}`} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{user.name}</h1>
            <p className="mt-1 text-sm text-white/85">{roleMap[user.role] ?? user.role}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
              <Calendar size={13} />
              Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-sand-100 pb-4">
          <h2 className="font-display text-xl text-ink">Compte</h2>
          <button
            onClick={toggleActive}
            disabled={actionLoading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              user.isActive
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
            {user.isActive ? "Suspendre" : "Réactiver"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-ink-soft">Email</p>
            <p className="mt-1 flex items-center gap-2 font-medium text-ink">
              <Mail size={14} />
              {user.email}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-ink-soft">Statut</p>
            <p className={`mt-1 font-medium ${user.isActive ? "text-emerald-600" : "text-amber-600"}`}>
              {user.isActive ? "Actif" : "Suspendu"}
            </p>
          </div>
        </div>

        {user.bio && (
          <div className="mt-4">
            <p className="text-xs uppercase text-ink-soft">Bio</p>
            <p className="mt-1 text-sm text-ink">{user.bio}</p>
          </div>
        )}
      </div>

      {user.expertProfile && (
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl text-ink">Profil expert</h2>

          <p className="font-semibold text-ink">{user.expertProfile.title}</p>

          {user.expertProfile.specialties?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.expertProfile.specialties.map((s) => (
                <span key={s} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Star size={14} />
              {user.expertProfile.rating.toFixed(1)} / 5 ({user.expertProfile.reviewCount} avis)
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <UsersIcon size={14} />
              {user.expertProfile.sessionCount} sessions données
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <BadgeCheck size={14} />
              {user.expertProfile.isApprovedByAdmin ? "Approuvée par l'admin" : "En attente d'approbation"}
            </div>
            <div className="text-sm text-ink-soft">
              {user.expertProfile.sessionRateDA} DA / session ·{" "}
              {user.expertProfile.availableForBooking ? "Disponible" : "Indisponible"}
            </div>
          </div>
        </div>
      )}

      {user.institutionProfile && (
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl text-ink">Profil institution</h2>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-rose-100">
              {user.institutionProfile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${ASSET_ORIGIN}${user.institutionProfile.logoUrl}`}
                  alt={user.institutionProfile.institutionName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 size={20} className="text-rose-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-ink">{user.institutionProfile.institutionName}</p>
              <p className="text-xs text-ink-soft">
                {user.institutionProfile.type} · {user.institutionProfile.city}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-ink-soft">
            {user.institutionProfile.websiteUrl && (
              <div className="flex items-center gap-2">
                <Globe size={14} />
                {user.institutionProfile.websiteUrl}
              </div>
            )}
            {user.institutionProfile.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail size={14} />
                {user.institutionProfile.contactEmail}
              </div>
            )}
            {user.institutionProfile.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone size={14} />
                {user.institutionProfile.contactPhone}
              </div>
            )}
            <div className="flex items-center gap-2">
              <BadgeCheck size={14} />
              {user.institutionProfile.isVerified ? "Vérifiée" : "Non vérifiée"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}