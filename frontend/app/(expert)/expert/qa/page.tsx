"use client";
import { useEffect, useState } from "react";
import { HelpCircle, ThumbsUp, Search, CheckCircle2, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Reveal } from "@/components/common/Reveal";
import { listAllQuestions, answerQuestion, voteQuestion, QAQuestion } from "@/lib/api/qa";

function formatRelative(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Hier" : `Il y a ${d}j`;
}

function QuestionCard({ q, onAnswered }: { q: QAQuestion; onAnswered: (updated: QAQuestion) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (answer.trim().length < 5) {
      setError("La réponse doit contenir au moins 5 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await answerQuestion(q.id, answer.trim());
      onAnswered(updated);
      setAnswer("");
      setExpanded(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  }

  async function vote() {
    try {
      const updated = await voteQuestion(q.id);
      onAnswered(updated);
    } catch {
      // non-critical, ignore
    }
  }

  return (
    <Reveal>
      <div className="card-surface p-5 shadow-card">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="rose">{q.category}</Badge>
          {q.isAnswered ? (
            <Badge tone="wine"><CheckCircle2 size={11} className="mr-1" />Répondu</Badge>
          ) : (
            <Badge tone="gold"><Clock size={11} className="mr-1" />En attente</Badge>
          )}
        </div>
        <h3 className="mb-2 font-display text-base text-ink leading-snug">{q.question}</h3>
        <div className="mb-3 flex items-center gap-3 text-xs text-ink-soft">
          <span>Posé par {q.asker?.name ?? "Anonyme"}</span>
          <span>{formatRelative(q.createdAt)}</span>
          <button onClick={vote} className="flex items-center gap-1 hover:text-rose-600">
            <ThumbsUp size={11} />
            {q.votes}
          </button>
        </div>

        {q.isAnswered && q.answer && (
          <div className="mb-3 rounded-xl bg-rose-50 p-4 text-sm text-ink-soft border border-rose-100">
            <p className="font-semibold text-rose-600 mb-1 text-xs">
              Réponse {q.answerer?.name ? `de ${q.answerer.name}` : ""}
            </p>
            {q.answer}
          </div>
        )}

        {!q.isAnswered && (
          <>
            {error && <p className="mb-2 text-xs text-rose-600">{error}</p>}
            {!expanded ? (
              <Button onClick={() => setExpanded(true)} size="sm" className="w-full">
                Répondre à cette question
              </Button>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  placeholder="Votre réponse experte…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none focus-ring focus:border-rose-400"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    onClick={submit}
                  >
                    {submitting ? "Envoi..." : "Publier la réponse"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setExpanded(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Reveal>
  );
}

export default function ExpertQAPage() {
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    listAllQuestions()
      .then(setQuestions)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }

  function handleUpdated(updated: QAQuestion) {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q)));
  }

  const filter = (answered: boolean) =>
    questions.filter(
      (q) => q.isAnswered === answered && q.question.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (<><Header title="Questions & Réponses" /><p className="text-sm text-ink-soft">Chargement...</p></>);
  if (error) return (<><Header title="Questions & Réponses" /><p className="text-sm text-rose-600">{error}</p></>);

  return (
    <>
      <Header title="Questions & Réponses" />
      <div className="mb-6 flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
        <Search size={15} className="text-ink-soft" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une question…"
          className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full"
        />
      </div>
      <Tabs
        tabs={[
          {
            label: `En attente (${filter(false).length})`,
            content:
              filter(false).length === 0 ? (
                <div className="card-surface shadow-card">
                  <EmptyState icon={HelpCircle} title="Aucune question en attente" description="Toutes les questions ont été répondues. Excellent travail !" />
                </div>
              ) : (
                <div className="space-y-4">
                  {filter(false).map((q) => (
                    <QuestionCard key={q.id} q={q} onAnswered={handleUpdated} />
                  ))}
                </div>
              ),
          },
          {
            label: `Répondues (${filter(true).length})`,
            content: (
              <div className="space-y-4">
                {filter(true).map((q) => (
                  <QuestionCard key={q.id} q={q} onAnswered={handleUpdated} />
                ))}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}