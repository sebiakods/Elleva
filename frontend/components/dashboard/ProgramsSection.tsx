"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  Calendar,
  Heart,
  Landmark,
  MapPin,
  Rocket,
  Search,
  Stamp,
} from "lucide-react";

// ---- Types (mirrors the FinancingProgram Prisma model) ----------------

type ProgramCategory =
  | "BANK_LOAN"
  | "ISLAMIC_FINANCE"
  | "GOVERNMENT_GRANT"
  | "STARTUP_FUNDING";

export interface ProgramCardData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  category: ProgramCategory;
  amountMin: number;
  amountMax: number;
  currency: string;
  closingDate: string | null;
  region: string | null;
  institutionName: string;
  isFavorite?: boolean;
  isUnlocked?: boolean;
}

// ---- Static meta --------------------------------------------------------

const CATEGORY_META: Record<ProgramCategory, { label: string; icon: typeof Banknote; badge: string }> = {
  BANK_LOAN: { label: "Prêt bancaire", icon: Banknote, badge: "bg-rose-50 text-rose-700 border-rose-200" },
  ISLAMIC_FINANCE: { label: "Finance islamique", icon: Landmark, badge: "bg-wine-50 text-wine-700 border-wine-200" },
  GOVERNMENT_GRANT: { label: "Subvention publique", icon: Building2, badge: "bg-gold-50 text-gold-700 border-gold-200" },
  STARTUP_FUNDING: { label: "Financement startup", icon: Rocket, badge: "bg-rose-50 text-rose-700 border-rose-200" },
};

// Swap for your real wilaya list if you already have one elsewhere.
const WILAYAS = ["Toutes les wilayas", "Alger", "Sétif", "Oran", "Constantine", "Annaba", "Béjaïa"];

const SORTS = [
  { value: "recent", label: "Plus récents" },
  { value: "amount_desc", label: "Montant décroissant" },
  { value: "deadline", label: "Échéance proche" },
] as const;

// ---- Mock data — replace with your API call once the route exists ------

const MOCK_PROGRAMS: ProgramCardData[] = [
  {
    id: "1",
    slug: "credit-jeune-promoteur",
    title: "Crédit Jeune Promoteur — ANADE",
    shortDescription: "Financement à taux bonifié pour la création d'entreprise, sans apport initial exigé.",
    category: "BANK_LOAN",
    amountMin: 500_000,
    amountMax: 5_000_000,
    currency: "DZD",
    closingDate: "2026-10-15",
    region: "National",
    institutionName: "Banque Nationale d'Algérie",
  },
  {
    id: "2",
    slug: "mourabaha-entreprendre",
    title: "Mourabaha Entreprendre",
    shortDescription: "Financement conforme à la Charia pour l'acquisition d'équipement professionnel.",
    category: "ISLAMIC_FINANCE",
    amountMin: 1_000_000,
    amountMax: 8_000_000,
    currency: "DZD",
    closingDate: "2026-09-30",
    region: "Sétif",
    institutionName: "Al Baraka Bank Algérie",
    isFavorite: true,
  },
  {
    id: "3",
    slug: "fonds-appui-femmes-entrepreneures",
    title: "Fonds d'appui aux femmes entrepreneures",
    shortDescription: "Subvention non remboursable pour projets portés par des femmes, secteurs prioritaires.",
    category: "GOVERNMENT_GRANT",
    amountMin: 200_000,
    amountMax: 2_000_000,
    currency: "DZD",
    closingDate: "2026-08-31",
    region: "National",
    institutionName: "Ministère de la Solidarité Nationale",
    isUnlocked: true,
  },
  {
    id: "4",
    slug: "accelerateur-startup-dz",
    title: "Accélérateur Startup DZ — Cohorte 6",
    shortDescription: "Financement d'amorçage + mentorat pour startups technologiques en phase pré-seed.",
    category: "STARTUP_FUNDING",
    amountMin: 1_500_000,
    amountMax: 10_000_000,
    currency: "DZD",
    closingDate: "2026-11-01",
    region: "Alger",
    institutionName: "Algeria Venture",
  },
];

// ---- Helpers -------------------------------------------------------------

function formatDA(n: number) {
  return new Intl.NumberFormat("fr-DZ").format(n);
}

function daysUntil(iso: string | null) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ---- Locked financial block ("cachet" paywall) ---------------------------

function LockedDetails({ program, onUnlock }: { program: ProgramCardData; onUnlock: () => void }) {
  return (
    <div className="relative mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <div className="pointer-events-none select-none blur-[5px]" aria-hidden="true">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <Banknote className="h-4 w-4" />
          {formatDA(program.amountMin)} – {formatDA(program.amountMax)} {program.currency}
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Clôture dans {daysUntil(program.closingDate)} j
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {program.region}
          </span>
        </div>
      </div>

      {/* Signature element: rotated official-stamp badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="flex h-14 w-14 -rotate-12 items-center justify-center rounded-full border-2 border-dashed border-gold-500/70 bg-white/70 shadow-sm">
          <Stamp className="h-6 w-6 text-gold-600" />
        </div>
        <span className="-rotate-12 text-[10px] font-semibold tracking-widest text-gold-700">
          NON DÉVOILÉ
        </span>
      </div>

      <button
        type="button"
        onClick={onUnlock}
        className="relative mt-14 w-full rounded-lg bg-gold-600 py-2 text-sm font-semibold text-white transition hover:bg-gold-700"
      >
        Débloquer les détails
      </button>
    </div>
  );
}

function UnlockedDetails({ program }: { program: ProgramCardData }) {
  const days = daysUntil(program.closingDate);
  return (
    <div className="mt-3 rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-stone-800">
        <Banknote className="h-4 w-4 text-gold-600" />
        {formatDA(program.amountMin)} – {formatDA(program.amountMax)} {program.currency}
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-xs text-stone-500">
        {days !== null && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Clôture dans {days} j
          </span>
        )}
        {program.region && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {program.region}
          </span>
        )}
      </div>
    </div>
  );
}

// ---- Card ----------------------------------------------------------------

function ProgramCard({
  program,
  onToggleFavorite,
  onUnlock,
}: {
  program: ProgramCardData;
  onToggleFavorite: (id: string) => void;
  onUnlock: (id: string) => void;
}) {
  const meta = CATEGORY_META[program.category];
  const Icon = meta.icon;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.badge}`}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite(program.id)}
          aria-label="Ajouter aux favoris"
          className="text-stone-300 transition hover:text-rose-500"
        >
          <Heart className={`h-5 w-5 ${program.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      <h3 className="mt-3 font-semibold leading-snug text-wine-900">{program.title}</h3>
      <p className="mt-1 text-sm text-stone-500 line-clamp-2">{program.shortDescription}</p>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
        <Building2 className="h-3.5 w-3.5" />
        {program.institutionName}
      </div>

      {program.isUnlocked ? (
        <UnlockedDetails program={program} />
      ) : (
        <LockedDetails program={program} onUnlock={() => onUnlock(program.id)} />
      )}
    </div>
  );
}

// ---- Filter bar ------------------------------------------------------------

function FilterBar({
  search,
  onSearch,
  category,
  onCategory,
  wilaya,
  onWilaya,
  sort,
  onSort,
}: {
  search: string;
  onSearch: (v: string) => void;
  category: ProgramCategory | "ALL";
  onCategory: (v: ProgramCategory | "ALL") => void;
  wilaya: string;
  onWilaya: (v: string) => void;
  sort: (typeof SORTS)[number]["value"];
  onSort: (v: (typeof SORTS)[number]["value"]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher un programme…"
            className="w-full rounded-lg border border-stone-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <select
          value={wilaya}
          onChange={(e) => onWilaya(e.target.value)}
          className="rounded-lg border border-stone-200 py-2 px-3 text-sm text-stone-600 outline-none focus:border-rose-400"
        >
          {WILAYAS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as (typeof SORTS)[number]["value"])}
          className="rounded-lg border border-stone-200 py-2 px-3 text-sm text-stone-600 outline-none focus:border-rose-400"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", ...Object.keys(CATEGORY_META)] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategory(c as ProgramCategory | "ALL")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              category === c
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:border-rose-300"
            }`}
          >
            {c === "ALL" ? "Tous" : CATEGORY_META[c as ProgramCategory].label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Main section ----------------------------------------------------------

export function ProgramsSection({
  programs = MOCK_PROGRAMS,
  onUnlockRequest,
}: {
  programs?: ProgramCardData[];
  /** Called when the user taps "Débloquer les détails" — wire this to your payment/premium flow */
  onUnlockRequest?: (programId: string) => void;
}) {
  const [items, setItems] = useState(programs);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProgramCategory | "ALL">("ALL");
  const [wilaya, setWilaya] = useState(WILAYAS[0]);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("recent");

  const filtered = useMemo(() => {
    let list = items.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "ALL" || p.category === category;
      const matchesWilaya = wilaya === WILAYAS[0] || p.region === wilaya;
      return matchesSearch && matchesCategory && matchesWilaya;
    });

    if (sort === "amount_desc") {
      list = [...list].sort((a, b) => b.amountMax - a.amountMax);
    }
    if (sort === "deadline") {
      list = [...list].sort(
        (a, b) => (daysUntil(a.closingDate) ?? Infinity) - (daysUntil(b.closingDate) ?? Infinity)
      );
    }
    return list;
  }, [items, search, category, wilaya, sort]);

  function toggleFavorite(id: string) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
  }

  function unlock(id: string) {
    onUnlockRequest?.(id);
    // TODO: replace with real unlock flow (payment/subscription check) once that route exists.
    // For now, optimistically unlock so the UI is demoable.
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isUnlocked: true } : p)));
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-wine-900">Programmes de financement</h2>
        <span className="text-xs text-stone-400">{filtered.length} programme(s)</span>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        wilaya={wilaya}
        onWilaya={setWilaya}
        sort={sort}
        onSort={setSort}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <ProgramCard key={p.id} program={p} onToggleFavorite={toggleFavorite} onUnlock={unlock} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-stone-400">
            Aucun programme ne correspond à ces filtres.
          </p>
        )}
      </div>
    </section>
  );
}
