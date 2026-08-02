"use client";

import { useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileBarChart,
  TrendingUp,
  Landmark,
  Users,
  FileText,
  FileSpreadsheet,
  Calendar,
  Loader2,
  Sparkles,
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

type ReportForm = {
  type: ReportType;
  program: string;
  periodStart: string;
  periodEnd: string;
  format: ReportFormat;
};

const PROGRAMS = [
  "Programme Innovation Femmes 2026",
  "Micro-crédit Numérique",
  "Subvention Agri-Femmes",
  "Prêt PME 2026",
  "Concours Santé & Innovation",
];

const TYPE_LABELS: Record<ReportType, string> = {
  taux_approbation: "Taux d'approbation",
  montants_engages: "Montants engagés",
  profils_beneficiaires: "Profils des bénéficiaires",
  impact_mesurable: "Impact mesurable",
};

const TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  taux_approbation:
    "Suivi du nombre de candidatures reçues, approuvées et refusées, avec taux d'approbation par programme.",
  montants_engages:
    "Détail des montants engagés et décaissés par programme et par période.",
  profils_beneficiaires:
    "Répartition des bénéficiaires par secteur, région et type de financement.",
  impact_mesurable:
    "Indicateurs d'impact : emplois créés, chiffre d'affaires généré, pérennité des entreprises soutenues.",
};

const TYPE_ICONS: Record<ReportType, typeof TrendingUp> = {
  taux_approbation: TrendingUp,
  montants_engages: Landmark,
  profils_beneficiaires: Users,
  impact_mesurable: FileBarChart,
};

const initialForm: ReportForm = {
  type: "taux_approbation",
  program: "",
  periodStart: "",
  periodEnd: "",
  format: "pdf",
};

type Toast = { type: "success" | "error"; text: string };

export default function NewReportPage() {
  const router = useRouter();

  const [form, setForm] = useState<ReportForm>(initialForm);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<Toast | null>(null);

  function update<K extends keyof ReportForm>(key: K, value: ReportForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.periodStart || !form.periodEnd) {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner une période avant de générer le rapport.",
      });
      return;
    }

    if (form.periodStart > form.periodEnd) {
      setMessage({
        type: "error",
        text: "La date de début doit être antérieure à la date de fin.",
      });
      return;
    }

    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setGenerating(false);

    setMessage({
      type: "success",
      text: "Le rapport est prêt à être généré lorsque le backend sera connecté.",
    });
  }

  const TypeIcon = TYPE_ICONS[form.type];

  const previewTitle = useMemo(() => {
    const label = TYPE_LABELS[form.type];
    return form.program ? `${label} — ${form.program}` : label;
  }, [form.type, form.program]);

  return (
    <>
      <Header title="Générer un rapport" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Nouveau rapport</Badge>
              <Badge tone="gold">Institution</Badge>
            </div>

            

            <p className="mt-3 max-w-3xl text-ink-soft">
              Sélectionnez le type de rapport, la période et le format
              d'export souhaités.
            </p>
          </div>

          <Link href="/institution/reports">
            <Button variant="outline">
              <ArrowLeft size={18} />
              Retour
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form className="space-y-8" onSubmit={submit}>
            {/* Report type */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <FileBarChart size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Type de rapport
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Choisissez les données que vous souhaitez analyser.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(TYPE_LABELS) as ReportType[]).map((type) => {
                  const Icon = TYPE_ICONS[type];
                  const active = form.type === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update("type", type)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-rose-400 bg-rose-50"
                          : "border-sand-200 bg-white hover:border-rose-200"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-rose-600 text-white"
                            : "bg-sand-100 text-ink-soft"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">
                          {TYPE_LABELS[type]}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {TYPE_DESCRIPTIONS[type]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Scope */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Landmark size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">Périmètre</h2>
                  <p className="text-sm text-ink-soft">
                    Restreignez le rapport à un programme spécifique si
                    besoin.
                  </p>
                </div>
              </div>

              <Select
                label="Programme (optionnel)"
                value={form.program}
                onChange={(e) => update("program", e.target.value)}
              >
                <option value="">Tous les programmes</option>
                {PROGRAMS.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </Select>
            </Card>

            {/* Period */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Calendar size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Période couverte
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Définissez la plage de dates à analyser.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  type="date"
                  label="Date de début"
                  value={form.periodStart}
                  onChange={(e) => update("periodStart", e.target.value)}
                />

                <Input
                  type="date"
                  label="Date de fin"
                  value={form.periodEnd}
                  onChange={(e) => update("periodEnd", e.target.value)}
                />
              </div>
            </Card>

            {/* Format */}
            <Card hover={false}>
              <div className="mb-6">
                <h2 className="font-display text-2xl text-ink">
                  Format d'export
                </h2>
                <p className="text-sm text-ink-soft">
                  Choisissez le format du fichier généré.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => update("format", "pdf")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    form.format === "pdf"
                      ? "border-rose-400 bg-rose-50"
                      : "border-sand-200 bg-white hover:border-rose-200"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      form.format === "pdf"
                        ? "bg-rose-600 text-white"
                        : "bg-sand-100 text-ink-soft"
                    }`}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">PDF</p>
                    <p className="text-xs text-ink-soft">
                      Prêt pour la lecture et le partage
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => update("format", "xlsx")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    form.format === "xlsx"
                      ? "border-rose-400 bg-rose-50"
                      : "border-sand-200 bg-white hover:border-rose-200"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      form.format === "xlsx"
                        ? "bg-rose-600 text-white"
                        : "bg-sand-100 text-ink-soft"
                    }`}
                  >
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Excel</p>
                    <p className="text-xs text-ink-soft">
                      Idéal pour l'analyse de données
                    </p>
                  </div>
                </button>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <Link href="/institution/reports">
                <button
                  type="button"
                  className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50"
                >
                  Annuler
                </button>
              </Link>

              <button
                type="submit"
                disabled={generating}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Générer le rapport
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview */}
          <aside className="sticky top-6 h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <FileBarChart size={18} />
              </div>
              <div>
                <h3 className="font-bold text-ink">Aperçu</h3>
                <p className="text-sm text-ink-soft">Résumé du rapport</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-sand-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <TypeIcon size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">
                  {previewTitle}
                </p>
                <p className="text-xs text-ink-soft">
                  {form.format === "pdf" ? "Format PDF" : "Format Excel"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Période</span>
                <span className="font-semibold text-ink">
                  {form.periodStart || "-"} → {form.periodEnd || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Programme</span>
                <span className="max-w-[60%] truncate text-right font-semibold text-ink">
                  {form.program || "Tous les programmes"}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-rose-50 p-4">
              <p className="text-sm text-rose-900">
                {TYPE_DESCRIPTIONS[form.type]}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {message && (
        <div
          className={`fixed bottom-6 right-6 rounded-xl px-5 py-4 text-sm font-semibold shadow-lg ${
            message.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}
    </>
  );
}