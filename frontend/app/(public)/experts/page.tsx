"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Loader2,
  UserRound,
} from "lucide-react";

import { Reveal } from "@/components/common/Reveal";

type Expert = {
  id: string;

  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    isVerified: boolean;
  };

  specialty?: string | null;
  bio?: string | null;
  profileImage?: string | null;
};

import { API_BASE_URL as API_URL } from "@/services/api";

export default function ExpertsDirectoryPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExperts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/experts`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer les expertes");
        }

        const data = await response.json();

        setExperts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Experts loading error:", err);
        setError("Impossible de charger les expertes.");
      } finally {
        setLoading(false);
      }
    }

    loadExperts();
  }, []);

  return (
    <div className="min-h-screen bg-sand-50">
      {/* ========================================================= */}
      {/* HERO                                                      */}
      {/* ========================================================= */}

      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">
              Trouvez votre guide
            </p>

            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              Annuaire des expertes
            </h1>

            <p className="mt-3 max-w-xl text-ink-soft">
              Connectez-vous avec des consultantes, mentores et conseillères
              vérifiées pour accélérer votre projet.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* EXPERTS                                                   */}
      {/* ========================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex items-center gap-3 text-ink-soft">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500" />

              <span>Chargement des expertes...</span>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="card-surface mx-auto max-w-xl p-10 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <GraduationCap className="h-8 w-8 text-rose-500" />
            </div>

            <h2 className="mt-5 font-display text-2xl text-ink">
              Une erreur est survenue
            </h2>

            <p className="mt-2 text-ink-soft">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && experts.length === 0 && (
          <div className="card-surface mx-auto max-w-xl p-10 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <GraduationCap className="h-8 w-8 text-rose-500" />
            </div>

            <h2 className="mt-5 font-display text-2xl text-ink">
              Aucune experte disponible
            </h2>

            <p className="mt-2 text-ink-soft">
              Les expertes disponibles apparaîtront ici.
            </p>
          </div>
        )}

        {/* EXPERTS LIST */}
        {!loading && !error && experts.length > 0 && (
          <>
            {/* Section title */}
            <div className="mb-8">
              <h2 className="font-display text-2xl text-ink">
                Nos expertes
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                {experts.length} experte
                {experts.length > 1 ? "s" : ""} disponible
                {experts.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => {
                const name = expert.user?.name || "Experte";

                const bio =
                  expert.bio ||
                  expert.user?.bio ||
                  "Experte Ellevadz spécialisée dans l’accompagnement des entrepreneures.";

                const image =
                  expert.profileImage ||
                  expert.user?.avatarUrl ||
                  null;

                return (
                  <article
                    key={expert.id}
                    className="card-surface overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* ================================================= */}
                    {/* CARD HEADER                                       */}
                    {/* ================================================= */}

                    <div className="bg-rise-gradient-soft px-6 pb-7 pt-8 text-center">
                      {/* Avatar */}
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="mx-auto h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-white"
                        />
                      ) : (
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 shadow-md ring-4 ring-white">
                          <UserRound className="h-10 w-10 text-rose-500" />
                        </div>
                      )}

                      {/* Name */}
                      <h3 className="mt-5 font-display text-2xl text-ink">
                        {name}
                      </h3>

                      {/* Specialty */}
                      {expert.specialty && (
                        <p className="mt-1 text-sm font-medium text-rose-500">
                          {expert.specialty}
                        </p>
                      )}

                      {/* Verified */}
                      {expert.user?.isVerified && (
                        <span className="mt-3 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          ✓ Experte vérifiée
                        </span>
                      )}
                    </div>

                    {/* ================================================= */}
                    {/* CARD DETAILS                                      */}
                    {/* ================================================= */}

                    <div className="space-y-5 p-6">
                      {/* About */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                          À propos
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-ink-soft">
                          {bio}
                        </p>
                      </div>

                      {/* Specialty */}
                      {expert.specialty && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                            Spécialité
                          </h4>

                          <p className="mt-2 text-sm font-medium text-ink">
                            {expert.specialty}
                          </p>
                        </div>
                      )}

                      {/* Email */}
                      {expert.user?.email && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                            Contact
                          </h4>

                          <p className="mt-2 break-all text-sm text-ink">
                            {expert.user.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
