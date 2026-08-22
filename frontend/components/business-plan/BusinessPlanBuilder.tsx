"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/business-plan/Stepper";
import { FormSection } from "@/components/business-plan/FormSection";
import { ProgressBar } from "@/components/business-plan/ProgressBar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createPlan, updatePlan, submitPlan, getPlan } from "@/lib/api/businessPlans";

const steps = ["Résumé", "Marché", "Stratégie", "Finances", "Révision"];

type FormData = {
  title: string;
  sector: string;
  vision: string;
  targetAudience: string;
  competitors: string;
  channels: string;
  marketing: string;
  initialInvestment: string;
  revenueYear1: string;
};

const emptyForm: FormData = {
  title: "",
  sector: "",
  vision: "",
  targetAudience: "",
  competitors: "",
  channels: "",
  marketing: "",
  initialInvestment: "",
  revenueYear1: "",
};

export function BusinessPlanBuilder({ planId: initialPlanId }: { planId?: string }) {
  const router = useRouter();

  const [planId, setPlanId] = useState<string | undefined>(initialPlanId);
  const [current, setCurrent] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(!!initialPlanId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = Math.round(((current + 1) / steps.length) * 100);

  // Load existing plan when editing
  useEffect(() => {
    if (!initialPlanId) return;
    getPlan(initialPlanId)
      .then((p) => {
        const es = (p.executiveSummary ?? {}) as any;
        const ma = (p.marketAnalysis ?? {}) as any;
        const st = (p.strategy ?? {}) as any;
        const fp = (p.financialPlan ?? {}) as any;
        setForm({
          title: p.title ?? "",
          sector: es.sector ?? "",
          vision: es.vision ?? "",
          targetAudience: ma.targetAudience ?? "",
          competitors: ma.competitors ?? "",
          channels: st.channels ?? "",
          marketing: st.marketing ?? "",
          initialInvestment: fp.initialInvestment ?? "",
          revenueYear1: fp.revenueYear1 ?? "",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initialPlanId]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      title: form.title.trim().length >= 3 ? form.title.trim() : "Sans titre",
      progress,
      executiveSummary: { sector: form.sector, vision: form.vision },
      marketAnalysis: { targetAudience: form.targetAudience, competitors: form.competitors },
      strategy: { channels: form.channels, marketing: form.marketing },
      financialPlan: { initialInvestment: form.initialInvestment, revenueYear1: form.revenueYear1 },
    };
  }

  // Creates the plan on first save, updates it on every subsequent save.
  async function persist(): Promise<string> {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      if (!planId) {
        const created = await createPlan(payload.title);
        await updatePlan(created.id, payload);
        setPlanId(created.id);
        return created.id;
      } else {
        await updatePlan(planId, payload);
        return planId;
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function goNext() {
    try {
      await persist();
      setCurrent((c) => Math.min(steps.length - 1, c + 1));
    } catch {
      // error already set
    }
  }

  async function goPrev() {
    setCurrent((c) => Math.max(0, c - 1));
  }

  async function handleSubmitToExpert() {
    try {
      const id = await persist();
      await submitPlan(id);
      alert("Votre business plan a été envoyé à une experte pour révision.");
      router.push("/dashboard/business-plans");
    } catch {
      // error already set, alert not needed twice
    }
  }

  async function handlePreview() {
    try {
      const id = await persist();
      router.push(`/dashboard/business-plans/${id}/preview`);
    } catch {
      // error already set
    }
  }

  if (loading) {
    return <div className="card-surface p-7 shadow-card sm:p-9 text-sm text-ink-soft">Chargement...</div>;
  }

  return (
    <div className="card-surface p-7 shadow-card sm:p-9">
      <div className="mb-8">
        <Stepper steps={steps} current={current} />
      </div>
      <ProgressBar value={progress} />

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-8 min-h-[260px]">
        {current === 0 && (
          <FormSection title="Résumé exécutif" description="Présentez votre projet en quelques phrases.">
            <Input
              label="Nom du projet"
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("title", e.target.value)}
              placeholder="Ex: Atelier Lumière"
            />
            <Select
              label="Secteur d'activité"
              value={form.sector}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update("sector", e.target.value)}
            >
              <option value="" disabled>Sélectionnez un secteur</option>
              <option>Artisanat</option>
              <option>Commerce</option>
              <option>Technologie</option>
              <option>Services</option>
            </Select>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Vision du projet</span>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] outline-none focus-ring focus:border-rose-400"
                placeholder="Décrivez votre projet en quelques phrases…"
                value={form.vision}
                onChange={(e) => update("vision", e.target.value)}
              />
            </label>
          </FormSection>
        )}
        {current === 1 && (
          <FormSection title="Analyse de marché" description="Décrivez votre cible et la concurrence.">
            <Input
              label="Clientèle cible"
              value={form.targetAudience}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("targetAudience", e.target.value)}
              placeholder="Ex: Femmes 25-45 ans, zones urbaines"
            />
            <Input
              label="Principaux concurrents"
              value={form.competitors}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("competitors", e.target.value)}
              placeholder="Ex: Marques locales similaires"
            />
          </FormSection>
        )}
        {current === 2 && (
          <FormSection title="Stratégie" description="Comment allez-vous atteindre vos clients ?">
            <Input
              label="Canaux de distribution"
              value={form.channels}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("channels", e.target.value)}
              placeholder="Ex: Boutique en ligne, marchés locaux"
            />
            <Input
              label="Stratégie marketing"
              value={form.marketing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("marketing", e.target.value)}
              placeholder="Ex: Réseaux sociaux, bouche-à-oreille"
            />
          </FormSection>
        )}
        {current === 3 && (
          <FormSection title="Plan financier" description="Connectez vos calculateurs pour préremplir cette section.">
            <Input
              label="Investissement initial estimé (DA)"
              type="number"
              value={form.initialInvestment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("initialInvestment", e.target.value)}
              placeholder="0"
            />
            <Input
              label="Chiffre d'affaires prévisionnel an 1 (DA)"
              type="number"
              value={form.revenueYear1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("revenueYear1", e.target.value)}
              placeholder="0"
            />
          </FormSection>
        )}
        {current === 4 && (
          <FormSection title="Révision finale" description="Vérifiez votre plan avant de le soumettre à une experte.">
            <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                Votre business plan est prêt. Vous pouvez le prévisualiser ou l&apos;envoyer directement à une experte pour révision.            </p>
          </FormSection>
        )}
      </div>

<div className="mt-8 flex justify-between">
  <Button
    variant="outline"
    onClick={() => !saving && goPrev()}
    className={`${current === 0 ? "invisible" : ""} ${saving ? "opacity-50 pointer-events-none" : ""}`}
  >
    Précédent
  </Button>

  {current < steps.length - 1 ? (
    <Button
      onClick={() => !saving && goNext()}
      className={saving ? "opacity-50 pointer-events-none" : ""}
    >
      {saving ? "Enregistrement..." : "Suivant"}
    </Button>
  ) : (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => !saving && handlePreview()}
        className={saving ? "opacity-50 pointer-events-none" : ""}
      >
        Aperçu
      </Button>
      <Button
        onClick={() => !saving && handleSubmitToExpert()}
        className={saving ? "opacity-50 pointer-events-none" : ""}
      >
        {saving ? "Envoi..." : "Envoyer à une experte"}
      </Button>
    </div>
  )}
</div>
    </div>
  );
}