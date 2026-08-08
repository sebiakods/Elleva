"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  FileText,
  Heart,
  Calculator,
  TrendingUp,
  Search,
  Lock,
  Star,
  Calendar,
  Building2,
  ArrowRight,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";

const filters = [
  "Tous",
  "Startup",
  "Agriculture",
  "Artisanat",
  "Innovation",
  "Formation",
];

const programs = [
  {
    id: 1,
    title: "Fonds d'amorçage Startups",
    category: "Startup",
    institution: "ANADE",
    amount: "Jusqu'à 5 000 000 DA",
    deadline: "30 Sept",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Programme Innovation Femmes",
    category: "Innovation",
    institution: "Ministère Startup",
    amount: "2 500 000 DA",
    deadline: "12 Oct",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Artisanat Premium",
    category: "Artisanat",
    institution: "CNAC",
    amount: "1 800 000 DA",
    deadline: "18 Oct",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Agriculture Verte",
    category: "Agriculture",
    institution: "BADR",
    amount: "4 000 000 DA",
    deadline: "25 Sept",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Formation Digitale",
    category: "Formation",
    institution: "INCUBME",
    amount: "Formation offerte",
    deadline: "Toujours ouvert",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Startup Elite",
    category: "Startup",
    institution: "Algeria Venture",
    amount: "7 000 000 DA",
    deadline: "02 Nov",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1400&auto=format&fit=crop",
  },
];

export default function DashboardHome() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const displayedPrograms = useMemo(() => {
    if (activeFilter === "Tous") return programs;

    return programs.filter(
      (p) => p.category === activeFilter
    );
  }, [activeFilter]);

  return (
    <>
      <Header title="Bonjour, Amina " />

      <StatsCards
        items={[
          {
            label: "Business plans",
            value: "3",
            icon: FileText,
            tone: "rose",
          },
          {
            label: "Programmes favoris",
            value: "7",
            icon: Heart,
            tone: "wine",
          },
          {
            label: "Simulations effectuées",
            value: "12",
            icon: Calculator,
            tone: "gold",
          },
          {
            label: "Progression globale",
            value: "68%",
            icon: TrendingUp,
            tone: "rose",
          },
        ]}
      />

      <section className="mt-10">

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="font-display text-3xl font-bold text-ink">
              Programmes Premium
            </h2>

            <p className="mt-2 text-ink-soft">
              Découvrez les meilleures opportunités de financement
              sélectionnées pour votre projet.
            </p>

          </div>

          <div className="relative w-full md:w-80">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50"
              size={18}
            />

            <input
              placeholder="Rechercher un programme..."
              aria-label="Rechercher un programme"
              className="h-12 w-full rounded-2xl border border-sand-200 bg-white pl-11 pr-4 text-ink outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />

          </div>

        </div>

        <div className="mb-8 flex flex-wrap gap-3">

          {filters.map((filter) => (

            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300

              ${
                activeFilter === filter
                  ? "bg-rise-gradient text-white shadow-bloom"
                  : "border border-sand-200 bg-white text-ink-soft hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              }
              `}
            >
              {filter}
            </button>

          ))}

        </div>

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {displayedPrograms.map((program, index) => (
            <article
              key={program.id}
              style={{ animationDelay: `${index * 80}ms` }}
              className="group relative animate-rise overflow-hidden rounded-xl2 border border-sand-200 bg-white shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-bloom"
            >
              <div className="relative h-64 overflow-hidden">

                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  className="object-cover blur-[5px] transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-wine-900/90 via-wine-900/30 to-transparent" />

                <div className="absolute left-5 top-5">
                  <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {program.category}
                  </span>
                </div>

                <div className="absolute right-5 top-5">
                  <span className="rounded-full bg-[linear-gradient(110deg,#C19A4B_25%,#F5E6C8_50%,#C19A4B_75%)] bg-[length:200%_100%] px-4 py-1 text-xs font-bold tracking-wide text-wine-800 shadow-md animate-shimmer">
                    PREMIUM
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">

                  <h3 className="font-display text-2xl font-bold leading-tight">
                    {program.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
                    <Building2 size={16} />
                    {program.institution}
                  </div>

                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-ink/80 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">

                  <div className="text-center">

                    <div className="mx-auto mb-5 flex h-20 w-20 animate-float items-center justify-center rounded-full bg-rise-gradient shadow-bloom">

                      <Lock className="text-white" size={34} />

                    </div>

                    <h3 className="font-display text-3xl font-bold text-white">
                      Pay to Unlock
                    </h3>

                    <p className="mt-3 max-w-xs text-sm text-white/80">
                      Débloquez l'accès complet à ce programme premium et
                      découvrez toutes les informations exclusives.
                    </p>

                    <button className="mt-7 rounded-2xl bg-rise-gradient px-7 py-3 font-semibold text-white shadow-bloom transition hover:scale-105">
                      Voir les offres Premium
                    </button>

                  </div>

                </div>

              </div>

              <div className="space-y-5 p-6">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Star
                      className="fill-gold-400 text-gold-500"
                      size={18}
                    />

                    <span className="font-semibold text-ink">
                      {program.rating}
                    </span>

                  </div>

                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    Nouveau
                  </span>

                </div>

                <div className="rounded-xl2 bg-sand-50 p-4">

                  <p className="text-xs uppercase tracking-wide text-ink-soft/70">
                    Financement
                  </p>

                  <p className="font-display mt-2 text-xl font-bold text-ink">
                    {program.amount}
                  </p>

                </div>

                <div className="flex items-center justify-between text-sm text-ink-soft">

                  <div className="flex items-center gap-2">

                    <Calendar size={16} />

                    {program.deadline}

                  </div>

                  <button className="flex items-center gap-2 font-semibold text-rose-600 transition group-hover:translate-x-1 hover:text-rose-700">

                    Découvrir

                    <ArrowRight size={16} />

                  </button>

                </div>

              </div>

            </article>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-[32px] bg-gradient-to-r from-gold-400 via-rose-500 to-wine-600 p-[1px] shadow-bloom">
          <div className="rounded-[31px] bg-rise-gradient p-8 text-white">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-sm font-semibold backdrop-blur">
                  ✨ Premium Membership
                </span>

                <h2 className="font-display mt-5 text-4xl font-bold">
                  Débloquez tous les programmes exclusifs
                </h2>

                <p className="mt-4 text-lg text-white/80">
                  Accédez aux opportunités de financement réservées aux membres
                  Premium, découvrez les critères d'éligibilité, les documents
                  demandés et bénéficiez d'un accompagnement personnalisé.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">

                  <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                    ✔ Programmes exclusifs
                  </div>

                  <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                    ✔ Accompagnement d'experts
                  </div>

                  <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                    ✔ Candidatures prioritaires
                  </div>

                  <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                    ✔ Support personnalisé
                  </div>

                </div>

              </div>

              <div className="flex flex-col gap-4">

                <button className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-wine-700 shadow-bloom transition duration-300 hover:scale-105">
                  Passer au Premium
                </button>

                <button className="rounded-2xl border border-white/30 px-8 py-4 text-lg font-semibold transition hover:bg-white/10">
                  En savoir plus
                </button>

              </div>

            </div>

          </div>
        </div>

      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentActivity />
        </div>

        <div className="space-y-6">
          <QuickActions />
          <NotificationPanel />
        </div>
      </div>
    </>
  );
}