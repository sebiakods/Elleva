"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, FileText, Star, Target, TrendingUp, Wallet } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getPlan, reviewPlan, BusinessPlan } from "@/lib/api/businessPlans";

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">{label}</p>
      <p className="mt-0.5 text-sm text-ink-soft leading-relaxed">{value}</p>
    </div>
  );
}

export default function BusinessPlanReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState(80);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPlan(params.id)
      .then((p) => {
        setPlan(p);
        if (p.reviewScore != null) setScore(p.reviewScore);
        if (p.reviewNotes) setComment(p.reviewNotes);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function submitReview(status: "APPROVED" | "REJECTED") {
    if (comment.trim().length < 10) {
      alert("Merci d'écrire au moins 10 caractères de commentaire.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await reviewPlan(params.id, { score, notes: comment, status });
      setPlan(updated);
      alert(status === "APPROVED" ? "Plan approuvé" : "Plan rejeté");
      router.push("/expert/business-plans");
    } catch (e: any) {
      alert(e.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (<><Header title="Révision du Business Plan" /><p className="text-sm text-ink-soft">Chargement...</p></>);
  if (error || !plan) return (<><Header title="Révision du Business Plan" /><p className="text-sm text-rose-600">{error || "Plan introuvable"}</p></>);

  const es = (plan.executiveSummary ?? {}) as any;
  const ma = (plan.marketAnalysis ?? {}) as any;
  const st = (plan.strategy ?? {}) as any;
  const fp = (plan.financialPlan ?? {}) as any;

  const statusLabel: Record<string, string> = {
    SUBMITTED: "En attente",
    IN_REVIEW: "En révision",
    APPROVED: "Approuvé",
    REJECTED: "Rejeté",
  };

  return (
    <>
      <Header title="Révision du Business Plan" />

      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.push("/expert/business-plans")}>
          <ArrowLeft size={16} />
          Retour
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface p-6">
            <div className="flex justify-between items-start">
              <div>
                <Badge tone="rose">Business Plan</Badge>
                <h1 className="mt-3 text-xl font-semibold text-ink">{plan.title}</h1>
                <p className="mt-2 text-sm text-ink-soft">Par {plan.owner?.name}</p>
              </div>
              <Badge tone="gold">{statusLabel[plan.status] ?? plan.status}</Badge>
            </div>
          </div>

          <div className="card-surface p-6">
            <h2 className="mb-4 font-semibold flex gap-2 items-center">
              <FileText size={18} />
              Résumé exécutif
            </h2>
            {es.sector || es.vision ? (
              <>
                <Field label="Secteur d'activité" value={es.sector} />
                <Field label="Vision du projet" value={es.vision} />
              </>
            ) : (
              <p className="text-sm text-ink-soft">Non renseigné.</p>
            )}
          </div>

          <div className="card-surface p-6">
            <h2 className="mb-4 font-semibold flex gap-2 items-center">
              <Target size={18} />
              Analyse de marché
            </h2>
            {ma.targetAudience || ma.competitors ? (
              <>
                <Field label="Clientèle cible" value={ma.targetAudience} />
                <Field label="Principaux concurrents" value={ma.competitors} />
              </>
            ) : (
              <p className="text-sm text-ink-soft">Non renseigné.</p>
            )}
          </div>

          <div className="card-surface p-6">
            <h2 className="mb-4 font-semibold flex gap-2 items-center">
              <TrendingUp size={18} />
              Stratégie
            </h2>
            {st.channels || st.marketing ? (
              <>
                <Field label="Canaux de distribution" value={st.channels} />
                <Field label="Stratégie marketing" value={st.marketing} />
              </>
            ) : (
              <p className="text-sm text-ink-soft">Non renseigné.</p>
            )}
          </div>

          <div className="card-surface p-6">
            <h2 className="mb-4 font-semibold flex gap-2 items-center">
              <Wallet size={18} />
              Plan financier
            </h2>
            {fp.initialInvestment || fp.revenueYear1 ? (
              <>
                <Field label="Investissement initial estimé" value={fp.initialInvestment && `${fp.initialInvestment} DA`} />
                <Field label="Chiffre d'affaires prévisionnel an 1" value={fp.revenueYear1 && `${fp.revenueYear1} DA`} />
              </>
            ) : (
              <p className="text-sm text-ink-soft">Non renseigné.</p>
            )}
          </div>

          <div className="card-surface p-6">
            <h2 className="mb-4 font-semibold">Commentaires pour l'entrepreneuse</h2>
            <textarea
              rows={6}
              className="w-full rounded-xl border p-3"
              placeholder="Écrivez vos remarques pour l'entrepreneure... (10 caractères min.)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="card-surface p-6">
            <h2 className="mb-4 font-semibold flex gap-2">
              <Star size={18} />
              Évaluation
            </h2>
            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-3 text-center">
              <span className="text-3xl font-bold text-rose-600">{score}</span>
              <span>/100</span>
            </div>
          </div>

<div className="card-surface p-6">
  <h2 className="mb-4 font-semibold">Actions</h2>
  <div className="space-y-3">
    <Button
      className={`w-full ${submitting ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => !submitting && submitReview("APPROVED")}
    >
      <CheckCircle2 size={16} />
      Approuver le plan
    </Button>

    <Button
      variant="secondary"
      className={`w-full ${submitting ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => !submitting && submitReview("REJECTED")}
    >
      <XCircle size={16} />
      Rejeter le plan
    </Button>
  </div>
</div>
        </div>
      </div>
    </>
  );
}