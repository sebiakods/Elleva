"use client";

import { useMemo, useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Landmark,
  Users,
  Percent,
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

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

const APPLICATIONS_BY_MONTH = [
  { month: "Fév", candidatures: 24, approuvees: 10 },
  { month: "Mar", candidatures: 31, approuvees: 14 },
  { month: "Avr", candidatures: 28, approuvees: 12 },
  { month: "Mai", candidatures: 42, approuvees: 19 },
  { month: "Juin", candidatures: 38, approuvees: 21 },
  { month: "Juil", candidatures: 45, approuvees: 24 },
];

const AMOUNTS_BY_PROGRAM = [
  { program: "Innovation Femmes", montant: 4200000 },
  { program: "Micro-crédit Numérique", montant: 1800000 },
  { program: "Subvention Agri-Femmes", montant: 2600000 },
  { program: "Prêt PME 2026", montant: 3100000 },
  { program: "Concours Santé", montant: 950000 },
];

const STATUS_BREAKDOWN = [
  { name: "Financées", value: 38, color: "#be123c" },
  { name: "En cours", value: 27, color: "#d97706" },
  { name: "En attente", value: 21, color: "#0369a1" },
  { name: "Refusées", value: 14, color: "#94a3b8" },
];

const SECTOR_BREAKDOWN = [
  { sector: "Numérique", value: 26 },
  { sector: "Artisanat", value: 19 },
  { sector: "Commerce", value: 17 },
  { sector: "Agriculture", value: 15 },
  { sector: "Santé", value: 12 },
  { sector: "Autres", value: 11 },
];

function formatDZD(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M DA`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} K DA`;
  return `${value} DA`;
}

export default function InstitutionAnalyticsPage() {
  const [period, setPeriod] = useState("6m");

  const totals = useMemo(() => {
    const totalApplications = APPLICATIONS_BY_MONTH.reduce(
      (sum, m) => sum + m.candidatures,
      0
    );
    const totalApproved = APPLICATIONS_BY_MONTH.reduce(
      (sum, m) => sum + m.approuvees,
      0
    );
    const conversionRate =
      totalApplications > 0
        ? Math.round((totalApproved / totalApplications) * 100)
        : 0;
    const totalAmount = AMOUNTS_BY_PROGRAM.reduce(
      (sum, p) => sum + p.montant,
      0
    );

    return { totalApplications, totalApproved, conversionRate, totalAmount };
  }, []);

  return (
    <>
      <Header title="Analytics" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Tableau de bord analytique</Badge>
            </div>

            
            <p className="mt-3 max-w-3xl text-ink-soft">
              Visualisez la performance de vos programmes : candidatures
              reçues, taux de conversion, montants engagés et impact sur
              l'écosystème entrepreneurial féminin.
            </p>
          </div>

          <div className="w-full sm:w-56">
            <Select
              label=""
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="3m">3 derniers mois</option>
              <option value="6m">6 derniers mois</option>
              <option value="12m">12 derniers mois</option>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Candidatures reçues</p>
                <p className="font-display text-2xl text-ink">
                  {totals.totalApplications}
                </p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Percent size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Taux de conversion</p>
                <p className="font-display text-2xl text-ink">
                  {totals.conversionRate}%
                </p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Landmark size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Montants engagés</p>
                <p className="font-display text-2xl text-ink">
                  {formatDZD(totals.totalAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Entrepreneures financées</p>
                <p className="font-display text-2xl text-ink">
                  {STATUS_BREAKDOWN.find((s) => s.name === "Financées")
                    ?.value ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Applications over time */}
          <Card hover={false}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <BarChart2 size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl text-ink">
                  Candidatures reçues
                </h2>
                <p className="text-sm text-ink-soft">
                  Évolution mensuelle des candidatures et approbations
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={APPLICATIONS_BY_MONTH}>
                  <defs>
                    <linearGradient id="colorCand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#be123c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#be123c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAppr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0369a1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0369a1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="candidatures"
                    name="Candidatures"
                    stroke="#be123c"
                    fill="url(#colorCand)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="approuvees"
                    name="Approuvées"
                    stroke="#0369a1"
                    fill="url(#colorAppr)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Amounts by program */}
          <Card hover={false}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Landmark size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl text-ink">
                  Montants engagés par programme
                </h2>
                <p className="text-sm text-ink-soft">
                  Répartition des financements accordés
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={AMOUNTS_BY_PROGRAM}
                  layout="vertical"
                  margin={{ left: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatDZD(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="program"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v: number) => formatDZD(v)} />
                  <Bar dataKey="montant" fill="#be123c" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Status breakdown */}
          <Card hover={false}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Percent size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl text-ink">
                  Statut des candidatures
                </h2>
                <p className="text-sm text-ink-soft">
                  Répartition actuelle par statut
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_BREAKDOWN}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {STATUS_BREAKDOWN.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Sector breakdown */}
          <Card hover={false}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Users size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl text-ink">
                  Répartition par secteur
                </h2>
                <p className="text-sm text-ink-soft">
                  Secteurs d'activité des entrepreneures soutenues
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SECTOR_BREAKDOWN}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis
                    dataKey="sector"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}