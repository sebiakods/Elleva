"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Landmark,
  Users,
  Percent,
  AlertCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Period = "3m" | "6m" | "12m";
type Accent = "rose" | "wine" | "amber" | "emerald" | "teal";

interface AnalyticsData {
  applicationsByMonth: { month: string; candidatures: number; approuvees: number }[];
  amountsByProgram: { program: string; montant: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
  sectorBreakdown: { sector: string; value: number }[];
  totals: {
    totalApplications: number;
    totalApproved: number;
    conversionRate: number;
    totalAmount: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "3m", label: "3 mois" },
  { value: "6m", label: "6 mois" },
  { value: "12m", label: "12 mois" },
];

const PERIOD_LABELS: Record<Period, string> = {
  "3m": "3 derniers mois",
  "6m": "6 derniers mois",
  "12m": "12 derniers mois",
};

const ACCENT_ICON_STYLES: Record<Accent, string> = {
  rose: "bg-rose-100 text-rose-600",
  wine: "bg-rose-200 text-rose-800",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  teal: "bg-teal-100 text-teal-600",
};

const CHART_COLORS = {
  candidatures: "#be123c",
  approuvees: "#881337",
  montant: "#d97706",
  secteur: "#0d9488",
};

const STATUS_COLOR_MAP: Record<string, string> = {
  Financées: "#059669",
  "En cours": "#d97706",
  "En attente": "#64748b",
  Refusées: "#cbd5e1",
};

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #fecdd3",
  boxShadow: "0 10px 25px -8px rgba(190,18,60,0.18)",
  fontSize: 13,
};

function formatDZD(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M DA`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} K DA`;
  return `${value} DA`;
}

async function fetchInstitutionAnalytics(period: Period): Promise<AnalyticsData> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const res = await fetch(`${API_BASE_URL}/institution/analytics?period=${period}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Impossible de charger les statistiques");
  }

  const json = await res.json();
  return json.data as AnalyticsData;
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                       */
/* ------------------------------------------------------------------ */

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div
      role="group"
      aria-label="Période d'analyse"
      className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-white p-1 shadow-sm"
    >
      {PERIOD_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-rose-600 text-white shadow-sm" : "text-ink-soft hover:text-rose-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-600/80">
      {children}
    </h2>
  );
}

function KpiCard({
  icon: Icon,
  accent,
  label,
  value,
}: {
  icon: LucideIcon;
  accent: Accent;
  label: string;
  value: string;
}) {
  return (
    <Card hover={false}>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ACCENT_ICON_STYLES[accent]}`}
        >
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-ink-soft">{label}</p>
          <p className="font-display text-2xl text-ink">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function ChartHeader({
  icon: Icon,
  accent,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  accent: Accent;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ACCENT_ICON_STYLES[accent]}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-display text-xl text-ink">{title}</h3>
        <p className="text-sm text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}

function ChartEmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-rose-200/70 bg-rose-50/40 px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-300 shadow-sm">
        <Icon size={20} />
      </div>
      <p className="max-w-[240px] text-sm text-ink-soft">{message}</p>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <Card hover={false}>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-rose-100/70" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-rose-100/70" />
          <div className="h-6 w-16 animate-pulse rounded bg-rose-100/70" />
        </div>
      </div>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card hover={false}>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-rose-100/70" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-rose-100/70" />
          <div className="h-3 w-56 animate-pulse rounded bg-rose-100/50" />
        </div>
      </div>
      <div className="h-72 w-full animate-pulse rounded-xl bg-rose-50" />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function InstitutionAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("6m");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (p: Period) => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchInstitutionAnalytics(p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(period);
  }, [period, loadAnalytics]);

  const totals = data?.totals ?? {
    totalApplications: 0,
    totalApproved: 0,
    conversionRate: 0,
    totalAmount: 0,
  };
  const fundedCount = data?.statusBreakdown?.find((s) => s.name === "Financées")?.value ?? 0;

  const hasAmountsData = (data?.amountsByProgram?.length ?? 0) > 0;
  const hasStatusData = (data?.statusBreakdown ?? []).reduce((sum, s) => sum + s.value, 0) > 0;
  const hasSectorData = (data?.sectorBreakdown?.length ?? 0) > 0;

  const isInitialLoading = isLoading && !data;

  return (
    <>


      <div className="mx-auto max-w-7xl space-y-10">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-ink-soft">
        <span>Espace Institution</span>
        <span className="mx-2 text-ink-soft/40">/</span>
        <span className="font-medium text-wine-700">Statistiques</span>
      </div>

      {/* Header Section */}
      <div className="relative mb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <p className="font-script text-2xl leading-none text-rose-500">
          Vue d&apos;ensemble
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          Tableau de bord - <span className="text-gradient-rise">Statistiques</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Votre Statistiques
        </p>
      </div>

        {/* Hero panel */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white px-6 py-8 sm:px-10 sm:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-[-40px] h-64 w-64 rounded-full bg-rise-gradient-soft opacity-60 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge tone="rose">Tableau de bord analytique</Badge>
              <p className="mt-4 text-sm leading-6 text-ink-soft">
                Suivez la performance de vos programmes de financement : candidatures reçues,
                taux de conversion, montants engagés et impact sur l'écosystème
                entrepreneurial féminin.
              </p>
            </div>
            <PeriodToggle value={period} onChange={setPeriod} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadAnalytics(period)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <RefreshCw size={14} />
              Réessayer
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="space-y-4">
          <SectionEyebrow>Résumé — {PERIOD_LABELS[period]}</SectionEyebrow>

          {isInitialLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={Users}
                accent="rose"
                label="Candidatures reçues"
                value={totals.totalApplications.toLocaleString("fr-FR")}
              />
              <KpiCard
                icon={Percent}
                accent="wine"
                label="Taux de conversion"
                value={`${totals.conversionRate}%`}
              />
              <KpiCard
                icon={Landmark}
                accent="amber"
                label="Montants engagés"
                value={formatDZD(totals.totalAmount)}
              />
              <KpiCard
                icon={TrendingUp}
                accent="emerald"
                label="Entrepreneures financées"
                value={fundedCount.toLocaleString("fr-FR")}
              />
            </div>
          )}
        </div>

        {/* Detailed charts */}
        <div className="space-y-4">
          <SectionEyebrow>Analyse détaillée</SectionEyebrow>

          {isInitialLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Applications over time */}
              <Card hover={false}>
                <ChartHeader
                  icon={BarChart2}
                  accent="rose"
                  title="Candidatures reçues"
                  subtitle="Évolution mensuelle des candidatures et approbations"
                />
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.applicationsByMonth ?? []}>
                      <defs>
                        <linearGradient id="colorCand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.candidatures} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CHART_COLORS.candidatures} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAppr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.approuvees} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={CHART_COLORS.approuvees} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5e5e9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={{ stroke: "#f5e5e9" }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area
                        type="monotone"
                        dataKey="candidatures"
                        name="Candidatures"
                        stroke={CHART_COLORS.candidatures}
                        fill="url(#colorCand)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="approuvees"
                        name="Approuvées"
                        stroke={CHART_COLORS.approuvees}
                        fill="url(#colorAppr)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Amounts by program */}
              <Card hover={false}>
                <ChartHeader
                  icon={Landmark}
                  accent="amber"
                  title="Montants engagés par programme"
                  subtitle="Répartition des financements en cours et accordés"
                />
                {hasAmountsData ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.amountsByProgram ?? []} layout="vertical" margin={{ left: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5e5e9" />
                        <XAxis
                          type="number"
                          tickFormatter={(v) => formatDZD(v)}
                          tick={{ fontSize: 11 }}
                          axisLine={{ stroke: "#f5e5e9" }}
                          tickLine={false}
                        />
                        <YAxis type="category" dataKey="program" width={140} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => formatDZD(Number(v))} />
                        <Bar dataKey="montant" fill={CHART_COLORS.montant} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <ChartEmptyState
                    icon={Landmark}
                    message="Aucun montant engagé sur cette période. Les candidatures soumises, en cours ou approuvées apparaîtront ici."
                  />
                )}
              </Card>

              {/* Status breakdown */}
              <Card hover={false}>
                <ChartHeader
                  icon={Percent}
                  accent="wine"
                  title="Statut des candidatures"
                  subtitle="Répartition actuelle par statut"
                />
                {hasStatusData ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.statusBreakdown ?? []}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                        >
                          {(data?.statusBreakdown ?? []).map((entry) => (
                            <Cell key={entry.name} fill={STATUS_COLOR_MAP[entry.name] ?? entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <ChartEmptyState
                    icon={Percent}
                    message="Aucune candidature sur cette période pour établir une répartition par statut."
                  />
                )}
              </Card>

              {/* Sector breakdown */}
              <Card hover={false}>
                <ChartHeader
                  icon={Users}
                  accent="teal"
                  title="Répartition par secteur"
                  subtitle="Secteurs d'activité des entrepreneures soutenues"
                />
                {hasSectorData ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.sectorBreakdown ?? []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5e5e9" />
                        <XAxis
                          dataKey="sector"
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={60}
                          axisLine={{ stroke: "#f5e5e9" }}
                          tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Bar dataKey="value" fill={CHART_COLORS.secteur} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <ChartEmptyState
                    icon={Users}
                    message="Aucune candidature répartie par secteur sur cette période."
                  />
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}