"use client";
import { BarChart2, Eye, Download, Calendar, Star, TrendingUp, Users } from "lucide-react";
import { PageShell } from "@/components/common/PageShell";
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

// --- Mock data (replace with API calls once backend is wired) ---

const kpis = [
  {
    label: "Vues de cours",
    value: "4 812",
    change: "+12,4%",
    icon: Eye,
  },
  {
    label: "Téléchargements",
    value: "1 236",
    change: "+8,1%",
    icon: Download,
  },
  {
    label: "Sessions réalisées",
    value: "58",
    change: "+3",
    icon: Calendar,
  },
  {
    label: "Note moyenne",
    value: "4,7 / 5",
    change: "+0,2",
    icon: Star,
  },
];

const monthlyActivity = [
  { month: "Fév", vues: 320, telechargements: 90, sessions: 4 },
  { month: "Mar", vues: 410, telechargements: 120, sessions: 6 },
  { month: "Avr", vues: 380, telechargements: 100, sessions: 5 },
  { month: "Mai", vues: 520, telechargements: 160, sessions: 7 },
  { month: "Jun", vues: 610, telechargements: 190, sessions: 9 },
  { month: "Jul", vues: 705, telechargements: 220, sessions: 11 },
];

const resourceBreakdown = [
  { type: "Cours vidéo", value: 42 },
  { type: "PDF / Guides", value: 28 },
  { type: "Modèles Business Plan", value: 18 },
  { type: "Articles", value: 12 },
];

const PIE_COLORS = ["#9d174d", "#be185d", "#db2777", "#f472b6"];

const topCourses = [
  { name: "Élaborer un business plan solide", views: 1240, downloads: 380, rating: 4.9 },
  { name: "Lever des fonds auprès des institutions", views: 980, downloads: 310, rating: 4.8 },
  { name: "Gestion financière pour entrepreneures", views: 860, downloads: 265, rating: 4.6 },
  { name: "Marketing digital à petit budget", views: 705, downloads: 190, rating: 4.7 },
];

const entrepreneurProgress = [
  { name: "Amina B.", program: "Incubation Sétif", progress: 82 },
  { name: "Nour K.", program: "Financement PME", progress: 64 },
  { name: "Sarah T.", program: "Incubation Sétif", progress: 45 },
  { name: "Yasmine R.", program: "Financement PME", progress: 91 },
];

export default function ExpertAnalyticsPage() {
  return (
    <>
      <PageShell
        title="Analytics"
        badge="Statistiques"
        icon={BarChart2}
        description="Analysez l'impact de votre activité : vues de cours, téléchargements de ressources, sessions réalisées, évaluations reçues et progression des entrepreneures."
      />

      <div className="space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">{kpi.value}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {kpi.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity over time */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">Activité mensuelle</h3>
            <p className="text-sm text-muted-foreground">
              Vues, téléchargements et sessions sur les 6 derniers mois
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyActivity}>
                <defs>
                  <linearGradient id="vuesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#be185d" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#be185d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="vues"
                  name="Vues"
                  stroke="#be185d"
                  fill="url(#vuesGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="telechargements"
                  name="Téléchargements"
                  stroke="#f472b6"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Resource breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Répartition des téléchargements
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceBreakdown}
                    dataKey="value"
                    nameKey="type"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {resourceBreakdown.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sessions bar chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Sessions réalisées par mois
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="sessions" name="Sessions" fill="#9d174d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top courses table */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-foreground">Cours les plus consultés</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Cours</th>
                  <th className="pb-2 font-medium">Vues</th>
                  <th className="pb-2 font-medium">Téléchargements</th>
                  <th className="pb-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((course) => (
                  <tr key={course.name} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{course.name}</td>
                    <td className="py-3 text-muted-foreground">{course.views.toLocaleString("fr-FR")}</td>
                    <td className="py-3 text-muted-foreground">
                      {course.downloads.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {course.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entrepreneur progress */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Progression des entrepreneures suivies
            </h3>
          </div>
          <div className="space-y-4">
            {entrepreneurProgress.map((entrepreneur) => (
              <div key={entrepreneur.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{entrepreneur.name}</span>
                  <span className="text-muted-foreground">{entrepreneur.program}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${entrepreneur.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}