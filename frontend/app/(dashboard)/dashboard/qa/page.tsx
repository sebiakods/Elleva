"use client";
import { useEffect, useState } from "react";
import { HelpCircle, Plus, Clock, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { askQuestion, listMyQuestions, QAQuestion } from "@/lib/api/qa";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EntrepreneurQAPage() {
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    listMyQuestions()
      .then(setQuestions)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }

  async function submit() {
    setFormError(null);
    if (question.trim().length < 10) {
      setFormError("Votre question doit contenir au moins 10 caractères.");
      return;
    }
    if (!category.trim()) {
      setFormError("Merci de préciser une catégorie.");
      return;
    }
    setSubmitting(true);
    try {
      await askQuestion(question.trim(), category.trim());
      setQuestion("");
      setCategory("");
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header title="Questions & Réponses" />

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Poser une question
        </Button>
      </div>

      {showForm && (
        <div className="card-surface mb-6 p-6 shadow-card">
          <h2 className="mb-4 font-semibold text-ink">Nouvelle question</h2>
          {formError && <p className="mb-3 text-sm text-rose-600">{formError}</p>}
          <div className="space-y-3">
            <input
              placeholder="Catégorie (ex: Financement, Finance, Juridique...)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none focus-ring focus:border-rose-400"
            />
            <textarea
              rows={4}
              placeholder="Votre question pour nos expertes…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none focus-ring focus:border-rose-400"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={submit}>
                {submitting ? "Envoi..." : "Envoyer"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-ink-soft">Chargement...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && questions.length === 0 && (
        <div className="card-surface shadow-card">
          <EmptyState
            icon={HelpCircle}
            title="Aucune question pour le moment"
            description="Posez une question à nos expertes, vous recevrez une notification dès qu'elle sera répondue."
          />
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="card-surface p-5 shadow-card">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="rose">{q.category}</Badge>
              {q.isAnswered ? (
                <Badge tone="wine"><CheckCircle2 size={11} className="mr-1" />Répondu</Badge>
              ) : (
                <Badge tone="gold"><Clock size={11} className="mr-1" />En attente</Badge>
              )}
              <span className="text-xs text-ink-soft">{formatDate(q.createdAt)}</span>
            </div>
            <h3 className="mb-2 font-display text-base text-ink leading-snug">{q.question}</h3>

            {q.isAnswered && q.answer && (
              <div className="rounded-xl bg-rose-50 p-4 text-sm text-ink-soft border border-rose-100">
                <p className="mb-1 text-xs font-semibold text-rose-600">
                  Réponse {q.answerer?.name ? `de ${q.answerer.name}` : "de nos expertes"}
                </p>
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}