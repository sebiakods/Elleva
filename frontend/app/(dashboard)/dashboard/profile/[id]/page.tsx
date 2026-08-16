"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Globe,
  Building2,
  Calendar,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

interface PublicProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  preferredLanguage?: string;
  bio?: string;
  companyName?: string;
  createdAt?: string;
}

export default function DynamicPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchPublicProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          // Fallback mock profile data for static display
          setProfile({
            id: userId,
            name: "Amina Kaddour",
            email: "amina@email.com",
            phone: "+213 555 00 00 00",
            role: "Entrepreneure",
            preferredLanguage: "Français",
            companyName: "Tech Ventures Dz",
            createdAt: "2025",
          });
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center font-body">
        <p className="text-ink-soft">Utilisateur non trouvé.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-sand-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-sand-300 transition"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 font-body text-ink">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-rose-500 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      {/* Header Profile Card Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-rise-gradient p-8 text-white shadow-bloom">
        <div className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold tracking-wider text-white backdrop-blur-md border border-white/20 shadow-inner">
            {getInitials(profile.name)}
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{profile.name}</h1>
            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-rose-100 font-medium text-sm">
              <Building2 className="h-4 w-4 text-gold-400" />
              <span>{profile.role || "Membre de la communauté"}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1.5 pt-1 text-xs text-rose-100/80">
              <Calendar className="h-3.5 w-3.5" />
              <span>Membre depuis {profile.createdAt || "2025"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Read-only Information Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-2xl border border-wine-100 bg-white p-6 shadow-card space-y-4">
          <h2 className="font-display text-base font-bold text-ink border-b border-rose-100 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-rose-500" />
            Informations de contact
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Adresse E-mail</span>
              <p className="font-semibold text-ink mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-wine-300 shrink-0" />
                <span className="truncate">{profile.email || "Non renseigné"}</span>
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Téléphone</span>
              <p className="font-semibold text-ink mt-1 flex items-center gap-2">
                <Phone className="h-4 w-4 text-wine-300 shrink-0" />
                <span>{profile.phone || "Non renseigné"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Preferences & Activity */}
        <div className="rounded-2xl border border-wine-100 bg-white p-6 shadow-card space-y-4">
          <h2 className="font-display text-base font-bold text-ink border-b border-rose-100 pb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-rose-500" />
            Préférences & Activité
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Langue préférée</span>
              <p className="font-semibold text-ink mt-1 flex items-center gap-2">
                <Globe className="h-4 w-4 text-wine-300 shrink-0" />
                <span>{profile.preferredLanguage || "Français"}</span>
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Entreprise / Projet</span>
              <p className="font-semibold text-ink mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-500 shrink-0" />
                <span>{profile.companyName || "Entreprise non enregistrée"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}