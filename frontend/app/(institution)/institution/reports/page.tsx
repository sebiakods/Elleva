"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileBarChart,
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Landmark,
  Plus,
  Calendar,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type ReportType =
  | "taux_approbation"
  | "montants_engages"
  | "profils_beneficiaires"
  | "impact_mesurable";

type ReportFormat = "pdf" | "xlsx";

type ReportItem = {
  id: string;
  title: string;
  type: ReportType;
  program: string | null;
  periodStart: string;
  periodEnd: string;
  format: ReportFormat;
  generatedDate: string;
  size: string;
};

const MOCK_REPORTS: ReportItem[] = [
  {
    id: "1",
    title: "Taux d'approbation — S1 2026",
    type: "taux_approbation",
    program: null,
    periodStart: "2026-01-01",
    periodEnd: "2026-06-30",
    format: "pdf",
    generatedDate: "2026-07-02",
    size: "620 Ko",
  },
  {
    id: "2",
    title: "Montants engagés — Programme Innovation Femmes 2026",
    type: "montants_engages",
    program: "Programme Innovation Femmes 2026",
    periodStart: "2026-01-01",
    periodEnd: "2026-06-30",
    format: "xlsx",
    generatedDate: "2026-06-28",
    size: "184 Ko",
  },
  {
    id: "3",
    title: "Profils des bénéficiaires — Toutes régions",
    type: "profils_beneficiaires",
    program: null,
    periodStart: "2026-04-01",
    periodEnd: "2026-06-30",
    format: "pdf",
    generatedDate: "2026-07-05",
    size: "1.1 Mo",
  },
  {
    id: "4",
    title: "Impact mesurable — Subvention Agri-Femmes",
    type: "impact_mesurable",
    program: "Subvention Agri-Femmes",
    periodStart: "2026-01-01",
    periodEnd: "2026-07-01",
    format: "pdf",
    generatedDate: "2026-07-08",
    size: "890 Ko",
  },
  {
    id: "5",
    title: "Montants engagés — Prêt PME 2026",
    type: "montants_engages",
    program: "Prêt PME 2026",
    periodStart: "2026-02-01",
    periodEnd: "2026-05-31",
    format: "xlsx",
    generatedDate: "2026-06-10",
    size: "142 Ko",
  },
];

const TYPE_LABELS: Record<ReportType, string> = {
  taux_approbation: "Taux d'approbation",
  montants_engages: "Montants engagés",
  profils_beneficiaires: "Profils des bénéficiaires",
  impact_mesurable: "Impact mesurable",
};

const TYPE_TONES: Record<ReportType, "gold" | "wine" | "rose"> = {
  taux_approbation: "wine",
  montants_engages: "gold",
  profils_beneficiaires: "rose",
  impact_mesurable: "wine",
};

const TYPE_ICONS: Record<ReportType, typeof TrendingUp> = {
  taux_approbation: TrendingUp,
  montants_engages: Landmark,
  profils_beneficiaires: Users,
  impact_mesurable: FileBarChart,
};

const FORMAT_ICONS: Record<ReportFormat, typeof FileText> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
};

export default function InstitutionReportsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");
  const [formatFilter, setFormatFilter] = useState<"all" | ReportFormat>(
    "all"
  );

  const filtered = useMemo(() => {
    return MOCK_REPORTS.filter((r) => {
      const matchesQuery =
        query.trim() === "" ||
        r.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        (r.program ?? "").toLowerCase().includes(query.trim().toLowerCase());

      const matchesType = typeFilter === "all" || r.type === typeFilter;
      const matchesFormat = formatFilter === "all" || r.format === formatFilter;

      return matchesQuery && matchesType && matchesFormat;
    }).sort((a, b) => b.generatedDate.localeCompare(a.generatedDate));
  }, [query, typeFilter, formatFilter]);

  const stats = useMemo(() => {
    const total = MOCK_REPORTS.length;
    const thisMonth = MOCK_REPORTS.filter((r) =>
      r.generatedDate.startsWith("2026-07")
    ).length;
    const pdfCount = MOCK_REPORTS.filter((r) => r.format === "pdf").length;

    return { total, thisMonth, pdfCount };
  }, []);

  return (
    <>
      <Header title="Rapports" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Reporting</Badge>
            </div>

            

            <p className="mt-3 max-w-3xl text-ink-soft">
              Générez et exportez des rapports sur vos programmes : taux
              d'approbation, montants engagés, profils des bénéficiaires et
              impact mesurable.
            </p>
          </div>

          <Link href="/institution/reports/new">
            <Button>
              <Plus size={18} />
              Générer un rapport
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <FileBarChart size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Total rapports</p>
                <p className="font-display text-2xl text-ink">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Générés ce mois</p>
                <p className="font-display text-2xl text-ink">
                  {stats.thisMonth}
                </p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Format PDF</p>
                <p className="font-display text-2xl text-ink">
                  {stats.pdfCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card hover={false}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <Input
                placeholder="Rechercher un rapport ou un programme..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Select
              label=""
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | ReportType)
              }
            >
              <option value="all">Tous les types</option>
              <option value="taux_approbation">Taux d'approbation</option>
              <option value="montants_engages">Montants engagés</option>
              <option value="profils_beneficiaires">
                Profils des bénéficiaires
              </option>
              <option value="impact_mesurable">Impact mesurable</option>
            </Select>

            <Select
              label=""
              value={formatFilter}
              onChange={(e) =>
                setFormatFilter(e.target.value as "all" | ReportFormat)
              }
            >
              <option value="all">Tous les formats</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel</option>
            </Select>
          </div>
        </Card>

        {/* List */}
        {filtered.length === 0 ? (
          <Card hover={false}>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
                <FileBarChart size={22} />
              </div>
              <p className="font-display text-xl text-ink">
                Aucun rapport trouvé
              </p>
              <p className="max-w-md text-sm text-ink-soft">
                Essayez de modifier vos filtres ou générez un nouveau rapport.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((report) => {
              const TypeIcon = TYPE_ICONS[report.type];
              const FormatIcon = FORMAT_ICONS[report.format];

              return (
                <Card key={report.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                      <TypeIcon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge tone={TYPE_TONES[report.type]}>
                          {TYPE_LABELS[report.type]}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs uppercase text-ink-soft">
                          <FormatIcon size={12} />
                          {report.format} · {report.size}
                        </span>
                      </div>

                      <h3 className="font-display text-lg leading-snug text-ink">
                        {report.title}
                      </h3>

                      <p className="mt-1 text-sm text-ink-soft">
                        {report.program ?? "Tous les programmes"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-sand-100 pt-4 text-sm text-ink-soft">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(report.periodStart).toLocaleDateString(
                        "fr-FR"
                      )}{" "}
                      →{" "}
                      {new Date(report.periodEnd).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-ink-soft">
                      Généré le{" "}
                      {new Date(report.generatedDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>

                    <button className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
                      <Download size={16} />
                      Télécharger
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}